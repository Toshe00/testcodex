import { BACKGROUND_ASSET, BALANCE, CARD_LIBRARY, CASTLE_ASSETS, SIDES, SPELL_VFX, UNIT_SPRITES, WORLD } from "./data.js";
import { getDeploymentZone } from "./game.js";
import { getDragValidity } from "./input.js";

const BACKGROUND_IMAGE = preloadImage(BACKGROUND_ASSET);
const CASTLE_IMAGES = preloadCastleImages();
const UNIT_IMAGES = preloadUnitSprites();
const SPELL_IMAGES = preloadSpellEffects();
const CASTLE_LAYOUT = {
  player: { x: -8, y: 188, width: 286, height: 234, hpX: 108, hpY: 142 },
  enemy: { x: 922, y: 188, width: 286, height: 234, hpX: 1092, hpY: 142 },
};

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;
  }

  render() {
    const { ctx } = this;
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    drawBackground(ctx);
    drawDeploymentZones(ctx, this.game);
    drawCastles(ctx, this.game.state);
    drawLane(ctx);
    drawUnits(ctx, this.game.state.units);
    drawProjectiles(ctx, this.game.state.projectiles);
    drawSpellEffects(ctx, this.game.state.spellEffects);
    drawFloaters(ctx, this.game.state.floaters);
  }
}

function drawBackground(ctx) {
  if (BACKGROUND_IMAGE.complete && BACKGROUND_IMAGE.naturalWidth > 0) {
    drawImageCover(ctx, BACKGROUND_IMAGE, 0, 0, WORLD.width, WORLD.height);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#31464a");
  sky.addColorStop(0.52, "#24383a");
  sky.addColorStop(0.53, "#344335");
  sky.addColorStop(1, "#18231d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let i = 0; i < 9; i += 1) {
    const x = 80 + i * 138;
    ctx.beginPath();
    ctx.arc(x, 116 + (i % 2) * 34, 42 + (i % 3) * 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#4d613f";
  ctx.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);
  ctx.fillStyle = "#5f7249";
  ctx.fillRect(0, WORLD.groundY, WORLD.width, 12);
}

function drawLane(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(41, 35, 27, 0.42)";
  roundRect(ctx, 132, WORLD.laneY - 34, 936, 68, 34);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.setLineDash([16, 14]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, WORLD.laneY);
  ctx.lineTo(1050, WORLD.laneY);
  ctx.stroke();
  ctx.restore();
}

function drawDeploymentZones(ctx, game) {
  const playerZone = getDeploymentZone("player");
  const enemyZone = getDeploymentZone("enemy");
  const dragValidity = getDragValidity(game);
  const spellDrag = dragValidity && game.state.drag?.type === "spell";
  drawZone(ctx, enemyZone, "Enemy Spawn", "rgba(215, 86, 72, 0.13)", "rgba(215, 86, 72, 0.42)", false);
  if (spellDrag) {
    drawZone(
      ctx,
      dragValidity.zone,
      game.state.drag.cardId === "fireball" ? "Fireball Target" : "Spell Target",
      dragValidity.valid ? "rgba(255, 141, 85, 0.13)" : "rgba(255, 116, 109, 0.12)",
      dragValidity.valid ? "rgba(255, 141, 85, 0.82)" : "rgba(255, 116, 109, 0.9)",
      true
    );
  }
  drawZone(
    ctx,
    playerZone,
    "Deploy Zone",
    dragValidity && !spellDrag ? (dragValidity.valid ? "rgba(134, 230, 144, 0.28)" : "rgba(255, 116, 109, 0.18)") : "rgba(79, 176, 109, 0.14)",
    dragValidity && !spellDrag ? (dragValidity.valid ? "rgba(134, 230, 144, 0.9)" : "rgba(255, 116, 109, 0.9)") : "rgba(79, 176, 109, 0.48)",
    Boolean(dragValidity && !spellDrag)
  );
  if (game.state.invalidFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.state.invalidFlash * 3);
    drawZone(ctx, playerZone, "Invalid", "rgba(255, 116, 109, 0.18)", "rgba(255, 116, 109, 0.95)", true);
    ctx.restore();
  }
}

function drawZone(ctx, zone, label, fill, stroke, active) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = active ? 4 : 2;
  ctx.setLineDash(active ? [10, 8] : [14, 10]);
  roundRect(ctx, zone.x, zone.y, zone.width, zone.height, 10);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = stroke;
  ctx.font = "900 18px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, zone.x + zone.width / 2, zone.y + 26);
  ctx.restore();
}

function drawCastles(ctx, state) {
  drawCastle(ctx, state.player.castle, SIDES.player.color, "left");
  drawCastle(ctx, state.enemy.castle, SIDES.enemy.color, "right");
}

function drawCastle(ctx, castle, color, side) {
  const layout = CASTLE_LAYOUT[castle.side];
  const stage = getCastleStage(castle);
  const image = CASTLE_IMAGES[castle.side][stage];
  if (image.complete && image.naturalWidth > 0) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, layout.x, layout.y, layout.width, layout.height);
    if (castle.hitFlash > 0) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(255, 241, 182, 0.34)";
      ctx.fillRect(layout.x, layout.y, layout.width, layout.height);
    }
    ctx.restore();
    drawHpBar(ctx, layout.hpX, layout.hpY, 130, 12, castle.hp / castle.maxHp, color);
    return;
  }
  drawFallbackCastle(ctx, castle, color, side);
}

function drawFallbackCastle(ctx, castle, color, side) {
  const x = castle.x - castle.width / 2;
  const y = castle.y - castle.height / 2;
  ctx.save();
  ctx.fillStyle = castle.hitFlash > 0 ? "#fff1b6" : "#68777a";
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  roundRect(ctx, x, y, castle.width, castle.height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#465156";
  ctx.fillRect(x + 8, y - 28, 24, 42);
  ctx.fillRect(x + castle.width - 32, y - 28, 24, 42);
  ctx.fillRect(x + castle.width / 2 - 14, y - 42, 28, 56);

  ctx.fillStyle = side === "left" ? "#2e3a3c" : "#402d2d";
  ctx.fillRect(x + castle.width / 2 - 18, y + castle.height - 44, 36, 44);
  drawHpBar(ctx, castle.x, y - 56, 118, 12, castle.hp / castle.maxHp, color);
  ctx.restore();
}

function getCastleStage(castle) {
  const ratio = castle.hp / castle.maxHp;
  if (ratio <= 0) return "destroyed";
  if (ratio <= 0.5) return "damaged";
  return "full";
}

function preloadCastleImages() {
  const images = {};
  for (const [side, stages] of Object.entries(CASTLE_ASSETS)) {
    images[side] = {};
    for (const [stage, src] of Object.entries(stages)) {
      const image = new Image();
      image.src = src;
      images[side][stage] = image;
    }
  }
  return images;
}

function preloadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function preloadUnitSprites() {
  const images = {};
  for (const [cardId, sprite] of Object.entries(UNIT_SPRITES)) {
    images[cardId] = {};
    for (const [animationName, animation] of Object.entries(sprite.animations)) {
      images[cardId][animationName] = animation.frames.map((src) => preloadImage(src));
    }
  }
  return images;
}

function preloadSpellEffects() {
  const images = {};
  for (const [spellId, config] of Object.entries(SPELL_VFX)) {
    images[spellId] = {
      projectile: config.projectile.frames.map((src) => preloadImage(src)),
      impact: config.impact.frames.map((src) => preloadImage(src)),
    };
  }
  return images;
}

function drawImageCover(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawUnits(ctx, units) {
  const ordered = [...units].sort((a, b) => a.y - b.y);
  for (const unit of ordered) {
    drawUnit(ctx, unit);
  }
}

function drawUnit(ctx, unit) {
  const sprite = UNIT_SPRITES[unit.cardId];
  if (sprite && drawSpriteUnit(ctx, unit, sprite)) {
    return;
  }

  const card = CARD_LIBRARY[unit.cardId];
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.fillStyle = unit.hitFlash > 0 ? "#fff3bd" : card.visual.color;
  ctx.strokeStyle = unit.side === "player" ? SIDES.player.color : SIDES.enemy.color;
  ctx.lineWidth = unit.buffed ? 5 : 3;
  ctx.beginPath();
  ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#101316";
  ctx.font = `950 ${Math.max(16, unit.radius)}px Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.visual.glyph, 0, 1);

  if (unit.state === "attacking") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, unit.radius + 6, -0.5, 0.8);
    ctx.stroke();
  }

  if (unit.cardId === "banner") {
    ctx.strokeStyle = "rgba(87, 209, 194, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BALANCE.bannerBuffRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawHpBar(ctx, 0, -unit.radius - 17, 48, 6, unit.hp / unit.maxHp, unit.side === "player" ? SIDES.player.color : SIDES.enemy.color);
  ctx.restore();
}

function drawSpriteUnit(ctx, unit, sprite) {
  const animationName = resolveUnitAnimation(unit);
  const frames = UNIT_IMAGES[unit.cardId]?.[animationName];
  if (!frames?.length || !frames.every((image) => image.complete && image.naturalWidth > 0)) {
    return false;
  }

  const image = frames[getAnimationFrameIndex(unit, sprite, animationName)];
  const { source, draw, shadow } = sprite;
  const drawX = -draw.width / 2;
  const drawY = -draw.height + draw.feetOffsetY;

  ctx.save();
  ctx.translate(unit.x, unit.y);

  if (shadow) {
    ctx.fillStyle = shadow.color;
    ctx.beginPath();
    ctx.ellipse(0, 3, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (unit.buffed) {
    ctx.strokeStyle = "rgba(255, 217, 117, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -10, 30, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (unit.direction < 0) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    drawX,
    drawY,
    draw.width,
    draw.height
  );

  if (unit.hitFlash > 0) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(255, 241, 182, 0.38)";
    ctx.fillRect(drawX, drawY, draw.width, draw.height);
  }

  ctx.restore();

  if (unit.state === "attacking" && animationName !== "death") {
    ctx.save();
    ctx.translate(unit.x, unit.y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -12, 34, -0.5, 0.8);
    ctx.stroke();
    ctx.restore();
  }

  if (unit.state !== "dying") {
    drawHpBar(
      ctx,
      unit.x,
      unit.y - draw.height - 10,
      54,
      6,
      unit.hp / unit.maxHp,
      unit.side === "player" ? SIDES.player.color : SIDES.enemy.color
    );
  }
  return true;
}

function resolveUnitAnimation(unit) {
  if (unit.state === "dying") {
    return "death";
  }
  if (unit.attackAnimationTimer > 0) {
    return "attack";
  }
  return "idle";
}

function getAnimationFrameIndex(unit, sprite, animationName) {
  const animation = sprite.animations[animationName];
  const elapsed = animationName === "death"
    ? unit.deathElapsed
    : animationName === "attack"
      ? unit.attackAnimationElapsed
      : unit.idleAnimationTime;
  const rawIndex = Math.floor(elapsed / animation.frameDuration);
  if (animation.loop) {
    return rawIndex % animation.frames.length;
  }
  return Math.min(animation.frames.length - 1, rawIndex);
}

function drawProjectiles(ctx, projectiles) {
  for (const projectile of projectiles) {
    if (drawSpellProjectile(ctx, projectile)) {
      continue;
    }
    ctx.save();
    ctx.fillStyle = projectileColor(projectile);
    ctx.strokeStyle = projectileColor(projectile);
    ctx.lineWidth = 3;
    if (projectile.type === "fireball") {
      ctx.shadowColor = "#ff6d32";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (projectile.type === "heal") {
      ctx.shadowColor = "#82ff8b";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#173c20";
      ctx.beginPath();
      ctx.moveTo(projectile.x - 7, projectile.y);
      ctx.lineTo(projectile.x + 7, projectile.y);
      ctx.moveTo(projectile.x, projectile.y - 7);
      ctx.lineTo(projectile.x, projectile.y + 7);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.type === "magic" ? 9 : 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawSpellEffects(ctx, effects) {
  for (const effect of effects) {
    const t = effect.age / effect.duration;
    if (drawSpellImpact(ctx, effect, t)) {
      continue;
    }
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = effect.type === "heal" ? "#86ff98" : "#ff8d55";
    ctx.fillStyle = effect.type === "heal" ? "rgba(134, 255, 152, 0.15)" : "rgba(255, 116, 77, 0.18)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (0.45 + t * 0.75), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawSpellProjectile(ctx, projectile) {
  const config = SPELL_VFX[projectile.type]?.projectile;
  const frames = SPELL_IMAGES[projectile.type]?.projectile;
  if (!config || !frames?.length || !frames.every((image) => image.complete && image.naturalWidth > 0)) {
    return false;
  }

  const index = Math.floor(projectile.age / config.frameDuration) % frames.length;
  const image = frames[index];
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.shadowColor = config.glowColor;
  ctx.shadowBlur = 18;
  ctx.drawImage(
    image,
    projectile.x - config.draw.width / 2,
    projectile.y - config.draw.height / 2,
    config.draw.width,
    config.draw.height
  );
  ctx.restore();
  return true;
}

function drawSpellImpact(ctx, effect, t) {
  const config = SPELL_VFX[effect.type]?.impact;
  const frames = SPELL_IMAGES[effect.type]?.impact;
  if (!config || !frames?.length || !frames.every((image) => image.complete && image.naturalWidth > 0)) {
    return false;
  }

  const index = Math.min(frames.length - 1, Math.floor(effect.age / config.frameDuration));
  const image = frames[index];
  const drawWidth = config.draw.width * (0.94 + t * 0.16);
  const drawHeight = config.draw.height * (0.94 + t * 0.16);

  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.fillStyle = config.fillColor;
  ctx.strokeStyle = config.ringColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, effect.radius * (0.42 + t * 0.72), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    effect.x - drawWidth / 2,
    effect.y - drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.restore();
  return true;
}

function drawFloaters(ctx, floaters) {
  for (const floater of floaters) {
    const alpha = 1 - floater.age / floater.duration;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = floater.color;
    ctx.font = "900 18px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.62)";
    ctx.lineWidth = 4;
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.restore();
  }
}

function drawHpBar(ctx, x, y, w, h, ratio, color) {
  ctx.save();
  ctx.translate(x - w / 2, y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  roundRect(ctx, 0, 0, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, 1, 1, Math.max(0, (w - 2) * ratio), h - 2, h / 2);
  ctx.fill();
  ctx.restore();
}

function projectileColor(projectile) {
  if (projectile.type === "fireball") return "#ff6b32";
  if (projectile.type === "heal") return "#86ff98";
  if (projectile.type === "magic") return "#d595ff";
  return projectile.side === "player" ? SIDES.player.projectileColor : SIDES.enemy.projectileColor;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
