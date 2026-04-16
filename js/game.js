import { ACTIVE_DECKS, BALANCE, SIDES, SPELL_VFX, WORLD } from "./data.js";
import { DeckCycle } from "./cards.js";
import { EnemyAI } from "./ai.js";
import { applyDamage, applyHeal, createUnit, resetUnitIds, updateUnits } from "./units.js";

export class Game {
  constructor() {
    this.listeners = new Set();
    this.ai = new EnemyAI(this);
    this.revision = 0;
    this.reset();
  }

  reset() {
    this.revision += 1;
    resetUnitIds();
    this.state = {
      revision: this.revision,
      mode: "playing",
      elapsed: 0,
      drag: null,
      invalidFlash: 0,
      player: createSideState("player"),
      enemy: createSideState("enemy"),
      units: [],
      projectiles: [],
      floaters: [],
      spellEffects: [],
    };
    this.ai.reset();
    this.emit();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  update(dt) {
    const clampedDt = Math.min(dt, 0.05);
    if (this.state.mode !== "playing") {
      this.updateVisuals(clampedDt);
      return;
    }

    this.state.elapsed += clampedDt;
    this.regenMana(this.state.player, clampedDt);
    this.regenMana(this.state.enemy, clampedDt);
    this.ai.update(clampedDt);
    updateUnits(this, clampedDt);
    this.updateProjectiles(clampedDt);
    this.updateVisuals(clampedDt);
    this.emit();
  }

  regenMana(sideState, dt) {
    sideState.mana = Math.min(BALANCE.maxMana, sideState.mana + BALANCE.manaRegenPerSecond * dt);
  }

  playCard(side, handIndex, point) {
    const sideState = this.state[side];
    const card = sideState.deck.getCard(handIndex);
    if (!card || this.state.mode !== "playing") {
      return { ok: false, reason: "No card selected" };
    }
    if (sideState.mana < card.manaCost) {
      return { ok: false, reason: "Not enough mana" };
    }
    if (!this.isValidPlay(side, card, point)) {
      this.rejectDrop();
      return { ok: false, reason: "Invalid deployment" };
    }

    sideState.mana -= card.manaCost;
    const playedCard = sideState.deck.play(handIndex);
    if (playedCard.type === "unit") {
      this.spawnUnit(side, playedCard, point);
    } else {
      this.castSpell(side, playedCard, point);
    }
    this.emit();
    return { ok: true, card: playedCard };
  }

  isValidPlay(side, card, point) {
    if (!point || Number.isNaN(point.x) || Number.isNaN(point.y)) {
      return false;
    }
    if (card.type === "unit") {
      return rectContains(getDeploymentZone(side), point);
    }
    if (card.id === "fireball") {
      return rectContains(WORLD.spellTargetArea, point);
    }
    return rectContains(WORLD.battlefield, point) || isNearCastle(point, this.state[side].castle, card.radius || 90);
  }

  spawnUnit(side, card, point) {
    const zone = getDeploymentZone(side);
    const x = clamp(point.x, zone.x + 20, zone.x + zone.width - 20);
    const y = clamp(point.y, WORLD.laneY - 32, WORLD.laneY + 32);
    this.state.units.push(createUnit(card.id, side, x, y));
    this.addFloater(card.name, x, y - 54, SIDES[side].color);
  }

  castSpell(side, card, point) {
    const start = side === "player"
      ? { x: this.state.player.castle.x + 22, y: WORLD.castleY - 70 }
      : { x: this.state.enemy.castle.x - 22, y: WORLD.castleY - 70 };
    const projectileVfx = SPELL_VFX[card.id]?.projectile;

    this.state.projectiles.push({
      id: `${card.id}-${Date.now()}-${Math.random()}`,
      side,
      type: card.id,
      x: start.x,
      y: start.y,
      fromX: start.x,
      fromY: start.y,
      toX: point.x,
      toY: point.y,
      age: 0,
      duration: projectileVfx?.duration ?? 0.42,
      radius: card.radius,
      onImpact: () => this.resolveSpell(side, card, point),
    });
  }

  resolveSpell(side, card, point) {
    const impactVfx = SPELL_VFX[card.id]?.impact;
    this.state.spellEffects.push({
      type: card.id,
      x: point.x,
      y: point.y,
      radius: card.radius,
      age: 0,
      duration: impactVfx?.duration ?? 0.34,
    });

    if (card.id === "fireball") {
      const enemySide = side === "player" ? "enemy" : "player";
      for (const unit of this.state.units) {
        if (unit.side === side || unit.hp <= 0) continue;
        const distance = Math.hypot(unit.x - point.x, unit.y - point.y);
        if (distance <= card.radius + unit.radius) {
          const falloff = 1 - Math.min(0.42, distance / (card.radius * 2.4));
          applyDamage(this, { kind: "unit", ref: unit }, Math.round(card.damage * falloff));
        }
      }
      const enemyCastle = this.state[enemySide].castle;
      if (isNearCastle(point, enemyCastle, card.radius)) {
        applyDamage(this, { kind: "castle", ref: enemyCastle }, Math.round(card.damage * card.castleMultiplier));
      }
    }

    if (card.id === "heal") {
      for (const unit of this.state.units) {
        if (unit.side !== side || unit.hp <= 0) continue;
        const distance = Math.hypot(unit.x - point.x, unit.y - point.y);
        if (distance <= card.radius + unit.radius) {
          const falloff = 1 - Math.min(0.3, distance / (card.radius * 2.8));
          applyHeal(this, { kind: "unit", ref: unit }, card.heal * falloff);
        }
      }
      const ownCastle = this.state[side].castle;
      if (isNearCastle(point, ownCastle, card.radius)) {
        applyHeal(this, { kind: "castle", ref: ownCastle }, Math.round(card.heal * card.castleMultiplier));
      }
    }
  }

  updateProjectiles(dt) {
    const remaining = [];
    for (const projectile of this.state.projectiles) {
      projectile.age += dt;
      const t = Math.min(1, projectile.age / projectile.duration);
      const arc = Math.sin(t * Math.PI) * 44;
      projectile.x = lerp(projectile.fromX, projectile.toX, t);
      projectile.y = lerp(projectile.fromY, projectile.toY, t) - arc;
      if (t >= 1) {
        projectile.onImpact?.();
      } else {
        remaining.push(projectile);
      }
    }
    this.state.projectiles = remaining;
  }

  updateVisuals(dt) {
    this.state.invalidFlash = Math.max(0, this.state.invalidFlash - dt);
    this.state.player.castle.hitFlash = Math.max(0, this.state.player.castle.hitFlash - dt);
    this.state.enemy.castle.hitFlash = Math.max(0, this.state.enemy.castle.hitFlash - dt);
    for (const floater of this.state.floaters) {
      floater.age += dt;
      floater.y -= 34 * dt;
    }
    this.state.floaters = this.state.floaters.filter((floater) => floater.age < floater.duration);

    for (const effect of this.state.spellEffects) {
      effect.age += dt;
    }
    this.state.spellEffects = this.state.spellEffects.filter((effect) => effect.age < effect.duration);
  }

  addFloater(text, x, y, color) {
    this.state.floaters.push({ text, x, y, color, age: 0, duration: 0.8 });
  }

  rejectDrop() {
    this.state.invalidFlash = 0.38;
    this.emit();
  }

  checkGameOver() {
    if (this.state.enemy.castle.hp <= 0 && this.state.mode === "playing") {
      this.state.mode = "won";
    }
    if (this.state.player.castle.hp <= 0 && this.state.mode === "playing") {
      this.state.mode = "lost";
    }
    this.emit();
  }

  renderTextState() {
    const payload = {
      note: "Origin is top-left. X increases right, Y increases down.",
      mode: this.state.mode,
      elapsed: Number(this.state.elapsed.toFixed(1)),
      player: summarizeSide(this.state.player),
      enemy: summarizeSide(this.state.enemy),
      units: this.state.units.map((unit) => ({
        id: unit.id,
        card: unit.cardId,
        side: unit.side,
        x: Math.round(unit.x),
        y: Math.round(unit.y),
        hp: Math.round(unit.hp),
        state: unit.state,
      })),
      projectiles: this.state.projectiles.length,
      zones: {
        playerDeployment: WORLD.playerDeployment,
        enemyDeployment: WORLD.enemyDeployment,
        spellTargetArea: WORLD.spellTargetArea,
      },
    };
    return JSON.stringify(payload);
  }
}

function createSideState(side) {
  const sideData = SIDES[side];
  return {
    mana: BALANCE.startingMana,
    deck: new DeckCycle(ACTIVE_DECKS[side]),
    castle: {
      side,
      x: sideData.castleX,
      y: WORLD.castleY,
      width: WORLD.castleWidth,
      height: WORLD.castleHeight,
      hp: BALANCE.castleHp,
      maxHp: BALANCE.castleHp,
      hitFlash: 0,
    },
  };
}

function summarizeSide(side) {
  return {
    mana: Number(side.mana.toFixed(2)),
    castleHp: Math.round(side.castle.hp),
    hand: [...side.deck.hand],
    next: side.deck.queue[0],
  };
}

export function getDeploymentZone(side) {
  return side === "player" ? WORLD.playerDeployment : WORLD.enemyDeployment;
}

export function rectContains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function isNearCastle(point, castle, radius) {
  const closestX = clamp(point.x, castle.x - castle.width / 2, castle.x + castle.width / 2);
  const closestY = clamp(point.y, castle.y - castle.height / 2, castle.y + castle.height / 2);
  return Math.hypot(point.x - closestX, point.y - closestY) <= radius;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
