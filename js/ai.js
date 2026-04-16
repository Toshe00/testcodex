import { BALANCE, CARD_LIBRARY, WORLD } from "./data.js";

export class EnemyAI {
  constructor(game) {
    this.game = game;
    this.timer = BALANCE.aiFirstPlayDelay;
    this.cheapCardCooldown = 0;
  }

  reset() {
    this.timer = BALANCE.aiFirstPlayDelay;
    this.cheapCardCooldown = 0;
  }

  update(dt) {
    const state = this.game.state;
    if (state.mode !== "playing") {
      return;
    }

    this.cheapCardCooldown = Math.max(0, this.cheapCardCooldown - dt);
    this.timer -= dt;
    if (this.timer > 0) {
      return;
    }
    this.timer = this.nextDelay();

    const pressure = this.measurePressure();
    const defending = pressure > BALANCE.aiPressureThreshold;
    const activeEnemyUnits = state.units.filter((unit) => unit.side === "enemy").length;
    if (!defending && activeEnemyUnits >= BALANCE.aiIdleMaxActiveUnits) {
      return;
    }
    if (activeEnemyUnits >= BALANCE.aiMaxActiveUnits) {
      return;
    }

    const reserve = defending ? BALANCE.aiDefenseManaReserve : BALANCE.aiAttackManaReserve;
    const playable = state.enemy.deck.hand
      .map((id, index) => ({ card: CARD_LIBRARY[id], index }))
      .filter((entry) => entry.card.manaCost + reserve <= state.enemy.mana)
      .filter((entry) => defending || this.cheapCardCooldown <= 0 || !isCheapCard(entry.card));

    if (playable.length === 0) {
      return;
    }

    const chosen = defending ? this.chooseDefense(playable) : this.chooseAttack(playable, activeEnemyUnits);
    if (!chosen) {
      return;
    }

    const point = chosen.card.type === "spell"
      ? this.chooseSpellPoint(chosen.card, pressure)
      : this.chooseSpawnPoint(pressure);

    const result = this.game.playCard("enemy", chosen.index, point);
    if (result.ok && isCheapCard(chosen.card)) {
      this.cheapCardCooldown = BALANCE.aiCheapCardCooldown;
    }
  }

  measurePressure() {
    const playerUnits = this.game.state.units.filter((unit) => unit.side === "player");
    if (playerUnits.length === 0) {
      return 0;
    }
    let pressure = 0;
    for (const unit of playerUnits) {
      const progress = Math.max(0, Math.min(1, (unit.x - 560) / 430));
      pressure += progress * (unit.hp / unit.maxHp) * (unit.cardId === "giant" ? 1.35 : 1);
    }
    return pressure;
  }

  chooseDefense(playable) {
    const playerUnits = this.game.state.units.filter((unit) => unit.side === "player");
    const clustered = playerUnits.length >= 2;
    return playable
      .map((entry) => {
        let score = 0;
        if (entry.card.id === "fireball" && clustered) score += 7;
        if (entry.card.role === "Tank") score += 4;
        if (entry.card.role === "Magic Burst") score += clustered ? 5 : 2;
        if (entry.card.manaCost <= 3) score += 2;
        score += Math.random();
        return { ...entry, score };
      })
      .sort((a, b) => b.score - a.score)[0];
  }

  chooseAttack(playable, activeEnemyUnits) {
    return playable
      .map((entry) => {
        let score = Math.random() * 2;
        if (entry.card.id === "giant" && this.game.state.enemy.mana >= 8) score += 6;
        if (entry.card.role === "Ranged DPS") score += activeEnemyUnits === 0 ? 2 : 0.5;
        if (entry.card.role === "Fast Pressure") score += activeEnemyUnits === 0 ? 1.25 : -1;
        if (entry.card.role === "Tank") score += 2.5;
        if (entry.card.manaCost <= this.game.state.enemy.mana - 2) score += 1.5;
        if (isCheapCard(entry.card)) score -= 0.75;
        if (entry.card.type === "spell") score -= 2;
        return { ...entry, score };
      })
      .sort((a, b) => b.score - a.score)[0];
  }

  chooseSpawnPoint(pressure) {
    const zone = WORLD.enemyDeployment;
    const xOffset = pressure > 0.55 ? 34 : 18 + Math.random() * 70;
    return {
      x: zone.x + zone.width - xOffset,
      y: WORLD.laneY + (Math.random() - 0.5) * 26,
    };
  }

  chooseSpellPoint(card, pressure) {
    if (card.id === "fireball") {
      const playerUnits = this.game.state.units.filter((unit) => unit.side === "player");
      if (playerUnits.length > 0) {
        const target = playerUnits
          .map((unit) => ({ unit, score: unit.x + unit.hp * 0.04 }))
          .sort((a, b) => b.score - a.score)[0].unit;
        return { x: target.x, y: target.y };
      }
    }
    return pressure > 0.55
      ? { x: WORLD.enemyDeployment.x + 74, y: WORLD.laneY }
      : { x: 520 + Math.random() * 220, y: WORLD.laneY };
  }

  nextDelay() {
    return BALANCE.aiThinkMin + Math.random() * (BALANCE.aiThinkMax - BALANCE.aiThinkMin);
  }
}

function isCheapCard(card) {
  return card.manaCost <= 3 || card.id === "archer" || card.id === "bat" || card.id === "wolf";
}
