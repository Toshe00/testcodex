import { BALANCE, CARD_LIBRARY, getUnitAnimationDuration, SIDES, WORLD } from "./data.js";

let nextUnitId = 1;

export function resetUnitIds() {
  nextUnitId = 1;
}

export function createUnit(cardId, side, x, y) {
  const card = CARD_LIBRARY[cardId];
  const sideData = SIDES[side];
  return {
    id: nextUnitId++,
    cardId,
    name: card.name,
    side,
    x,
    y,
    vx: 0,
    hp: card.hp,
    maxHp: card.hp,
    damage: card.damage,
    range: card.range,
    attackCooldown: card.attackCooldown,
    attackTimer: 0.25,
    moveSpeed: card.moveSpeed,
    role: card.role,
    radius: card.radius,
    visual: card.visual,
    direction: sideData.direction,
    state: "moving",
    hitFlash: 0,
    buffed: false,
    idleAnimationTime: Math.random(),
    attackAnimationTimer: 0,
    attackAnimationElapsed: 0,
    attackAnimationDuration: getUnitAnimationDuration(cardId, "attack"),
    deathElapsed: 0,
    deathDuration: getUnitAnimationDuration(cardId, "death"),
    remove: false,
  };
}

export function updateUnits(game, dt) {
  const units = game.state.units;
  for (const unit of units) {
    unit.hitFlash = Math.max(0, unit.hitFlash - dt);

    if (unit.state === "dying" || unit.hp <= 0) {
      if (unit.state !== "dying") {
        startDeath(unit);
      }
      unit.deathElapsed += dt;
      if (unit.deathElapsed >= unit.deathDuration) {
        unit.remove = true;
      }
      continue;
    }

    unit.idleAnimationTime += dt;
    unit.attackTimer = Math.max(0, unit.attackTimer - dt);
    if (unit.attackAnimationTimer > 0) {
      unit.attackAnimationTimer = Math.max(0, unit.attackAnimationTimer - dt);
      unit.attackAnimationElapsed += dt;
    }
    unit.buffed = isBuffedByBanner(unit, units);

    if (unit.cardId === "banner") {
      supportBanner(game, unit, dt);
    }

    const target = findTarget(game, unit);
    if (target && target.kind === "unit" && target.distance > target.engageRange) {
      unit.state = "moving";
      unit.vx = Math.sign(target.ref.x - unit.x) * unit.moveSpeed;
      unit.x += unit.vx * dt;
    } else if (target && target.distance <= target.engageRange) {
      unit.vx = 0;
      unit.state = "attacking";
      if (unit.attackTimer <= 0) {
        unit.attackTimer = unit.attackCooldown;
        unit.attackAnimationTimer = unit.attackAnimationDuration;
        unit.attackAnimationElapsed = 0;
        attackTarget(game, unit, target);
      }
    } else {
      unit.state = "moving";
      unit.vx = unit.direction * unit.moveSpeed;
      unit.x += unit.vx * dt;
    }

    unit.x = Math.max(28, Math.min(WORLD.width - 28, unit.x));
  }

  game.state.units = units.filter((unit) => !unit.remove);
}

function findTarget(game, attacker) {
  const enemies = game.state.units.filter((unit) => unit.side !== attacker.side && unit.hp > 0);
  let best = null;
  for (const unit of enemies) {
    const distance = Math.abs(unit.x - attacker.x);
    const engageRange = attacker.range + unit.radius + BALANCE.unitRetargetPadding;
    const aggroRange = Math.max(engageRange, BALANCE.unitAggroRange);
    if (distance > aggroRange) {
      continue;
    }
    const lanePenalty = Math.abs(unit.y - attacker.y) * 0.35;
    const score = distance + lanePenalty;
    if (!best || score < best.score) {
      best = { kind: "unit", ref: unit, distance, radius: unit.radius, engageRange, score };
    }
  }

  if (best) {
    return best;
  }

  const enemySide = attacker.side === "player" ? "enemy" : "player";
  const castle = game.state[enemySide].castle;
  const castleEdgeX = castle.x - attacker.direction * (castle.width / 2);
  const castleDistance = Math.abs(castleEdgeX - attacker.x);
  const engageRange = attacker.range + BALANCE.castleDamageRange;
  if (castleDistance <= engageRange) {
    return {
      kind: "castle",
      ref: castle,
      distance: castleDistance,
      radius: BALANCE.castleDamageRange,
      engageRange,
      score: castleDistance,
    };
  }

  return best;
}

function attackTarget(game, attacker, target) {
  const card = CARD_LIBRARY[attacker.cardId];
  const damage = getDamage(attacker, target);
  const isRanged = attacker.range > 90 || attacker.cardId === "mage";
  if (isRanged) {
    const travel = Math.max(0.16, target.distance / (card.projectileSpeed || 500));
    game.state.projectiles.push({
      id: randomId(),
      side: attacker.side,
      type: attacker.cardId === "mage" ? "magic" : "arrow",
      x: attacker.x,
      y: attacker.y - attacker.radius,
      fromX: attacker.x,
      fromY: attacker.y - attacker.radius,
      toX: target.ref.x,
      toY: target.kind === "unit" ? target.ref.y - target.ref.radius : target.ref.y - 48,
      age: 0,
      duration: travel,
      onImpact: () => {
        if (attacker.cardId === "mage" && target.kind === "unit") {
          splashDamage(game, attacker, target.ref, damage, card.splashRadius);
        } else {
          applyDamage(game, target, damage, attacker);
        }
      },
    });
  } else {
    applyDamage(game, target, damage, attacker);
  }
}

function getDamage(attacker, target) {
  let damage = attacker.damage;
  if (attacker.buffed && attacker.cardId !== "banner") {
    damage *= BALANCE.bannerDamageBuff;
  }
  if (attacker.cardId === "spearman" && target.kind === "unit" && target.ref.maxHp >= BALANCE.highHpThreshold) {
    damage *= BALANCE.antiTankBonus;
  }
  if (attacker.cardId === "giant" && target.kind === "castle") {
    damage *= BALANCE.siegeCastleBonus;
  } else if (target.kind === "castle") {
    damage *= BALANCE.unitCastleDamageMultiplier;
  }
  return Math.round(damage);
}

function splashDamage(game, attacker, primary, damage, radius) {
  for (const unit of game.state.units) {
    if (unit.side === attacker.side || unit.hp <= 0) {
      continue;
    }
    const distance = Math.hypot(unit.x - primary.x, unit.y - primary.y);
    if (distance <= radius) {
      const falloff = unit.id === primary.id ? 1 : 0.58;
      applyDamage(game, { kind: "unit", ref: unit }, Math.round(damage * falloff), attacker);
    }
  }
}

export function applyDamage(game, target, amount) {
  if (!target || !target.ref || amount <= 0) {
    return;
  }
  const applied = Math.max(1, Math.round(amount));
  target.ref.hp = Math.max(0, target.ref.hp - applied);
  target.ref.hitFlash = 0.18;
  const y = target.kind === "unit" ? target.ref.y - target.ref.radius - 18 : target.ref.y - 96;
  game.addFloater(`-${applied}`, target.ref.x, y, "#ffdf75");
  if (target.kind === "castle") {
    game.checkGameOver();
  }
}

export function applyHeal(game, target, amount) {
  if (!target || !target.ref || amount <= 0) {
    return 0;
  }
  const before = target.ref.hp;
  target.ref.hp = Math.min(target.ref.maxHp, target.ref.hp + amount);
  const healed = Math.round(target.ref.hp - before);
  if (healed > 0) {
    target.ref.hitFlash = 0.16;
    const y = target.kind === "unit" ? target.ref.y - target.ref.radius - 18 : target.ref.y - 96;
    game.addFloater(`+${healed}`, target.ref.x, y, "#9dffac");
  }
  return healed;
}

function supportBanner(game, banner, dt) {
  for (const unit of game.state.units) {
    if (unit.side !== banner.side || unit.id === banner.id || unit.hp <= 0) {
      continue;
    }
    const distance = Math.hypot(unit.x - banner.x, unit.y - banner.y);
    if (distance <= BALANCE.bannerBuffRadius && unit.hp < unit.maxHp) {
      applyHeal(game, { kind: "unit", ref: unit }, BALANCE.bannerHealPerSecond * dt);
    }
  }
}

function isBuffedByBanner(unit, units) {
  if (unit.cardId === "banner") {
    return false;
  }
  return units.some((candidate) => {
    if (candidate.cardId !== "banner" || candidate.side !== unit.side || candidate.hp <= 0) {
      return false;
    }
    return Math.hypot(candidate.x - unit.x, candidate.y - unit.y) <= BALANCE.bannerBuffRadius;
  });
}

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function startDeath(unit) {
  unit.state = "dying";
  unit.vx = 0;
  unit.buffed = false;
  unit.attackAnimationTimer = 0;
  unit.attackAnimationElapsed = 0;
  unit.deathElapsed = 0;
  unit.deathDuration = Math.max(0.45, unit.deathDuration || 0);
}
