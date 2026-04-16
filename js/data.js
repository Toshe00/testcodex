export const WORLD = {
  width: 1200,
  height: 620,
  groundY: 420,
  laneY: 396,
  castleY: 294,
  castleWidth: 92,
  castleHeight: 176,
  battlefield: { x: 110, y: 92, width: 980, height: 390 },
  spellTargetArea: { x: 0, y: 0, width: 1200, height: 620 },
  playerDeployment: { x: 54, y: 255, width: 268, height: 226 },
  enemyDeployment: { x: 878, y: 255, width: 268, height: 226 },
};

export const BALANCE = {
  maxMana: 10,
  startingMana: 5,
  manaRegenPerSecond: 0.42,
  castleHp: 3200,
  castleDamageRange: 36,
  highHpThreshold: 780,
  antiTankBonus: 1.55,
  unitCastleDamageMultiplier: 0.14,
  siegeCastleBonus: 1.35,
  unitRetargetPadding: 18,
  unitAggroRange: 160,
  bannerBuffRadius: 126,
  bannerDamageBuff: 1.18,
  bannerHealPerSecond: 14,
  aiFirstPlayDelay: 3,
  aiThinkMin: 1.8,
  aiThinkMax: 3.2,
  aiPressureThreshold: 0.55,
  aiAttackManaReserve: 1,
  aiDefenseManaReserve: 0,
  aiCheapCardCooldown: 1.6,
  aiIdleMaxActiveUnits: 5,
  aiMaxActiveUnits: 7,
};

export const CARD_LIBRARY = {
  warrior: {
    id: "warrior",
    name: "Warrior",
    type: "unit",
    manaCost: 4,
    hp: 690,
    damage: 76,
    range: 38,
    attackCooldown: 0.86,
    moveSpeed: 50,
    role: "Shield Duelist",
    description: "Armored frontline fighter that mixes reliable pressure with strong staying power.",
    visual: { glyph: "W", color: "#ece7dd", shape: "blade", image: "./assets/cards/warrior.png" },
    radius: 19,
  },
  barbarian: {
    id: "barbarian",
    name: "Barbarian",
    type: "unit",
    manaCost: 4,
    hp: 650,
    damage: 92,
    range: 40,
    attackCooldown: 0.86,
    moveSpeed: 56,
    role: "Berserker",
    description: "Dual-blade bruiser that closes fast and wins messy skirmishes.",
    visual: { glyph: "B", color: "#ffc060", shape: "axe", image: "./assets/cards/barbarian.png" },
    radius: 19,
  },
  knight: {
    id: "knight",
    name: "Knight",
    type: "unit",
    manaCost: 4,
    hp: 1080,
    damage: 82,
    range: 42,
    attackCooldown: 1.08,
    moveSpeed: 36,
    role: "Tank",
    description: "High health, slow pressure, anchors a push.",
    visual: { glyph: "K", color: "#ff8a54", shape: "shield", image: "./assets/cards/fire-knight.png" },
    radius: 22,
  },
  archer: {
    id: "archer",
    name: "Archer",
    type: "unit",
    manaCost: 3,
    hp: 300,
    damage: 60,
    range: 178,
    attackCooldown: 0.95,
    moveSpeed: 42,
    role: "Ranged DPS",
    description: "Fragile long-range unit that fires arrows.",
    visual: { glyph: "A", color: "#9ee06e", shape: "bow", image: "./assets/cards/leaf-ranger.png" },
    radius: 16,
    projectileSpeed: 560,
  },
  bat: {
    id: "bat",
    name: "Bat",
    type: "unit",
    manaCost: 2,
    hp: 190,
    damage: 42,
    range: 30,
    attackCooldown: 0.58,
    moveSpeed: 110,
    role: "Fast Pressure",
    description: "Swift harasser that dives in for quick chip damage.",
    visual: { glyph: "B", color: "#b977ff", shape: "wing", image: "./assets/cards/bat.png" },
    radius: 13,
  },
  wolf: {
    id: "wolf",
    name: "Wolf",
    type: "unit",
    manaCost: 2,
    hp: 220,
    damage: 54,
    range: 30,
    attackCooldown: 0.64,
    moveSpeed: 104,
    role: "Pack Hunter",
    description: "Fast melee beast that darts in for quick bite damage.",
    visual: { glyph: "W", color: "#8ea0ff", shape: "fang", image: "./assets/cards/wolf.png" },
    radius: 15,
  },
  skeleton: {
    id: "skeleton",
    name: "Skeleton Warrior",
    type: "unit",
    manaCost: 3,
    hp: 440,
    damage: 68,
    range: 38,
    attackCooldown: 0.82,
    moveSpeed: 50,
    role: "Undead Frontline",
    description: "Relentless bone soldier that keeps steady melee pressure on the lane.",
    visual: { glyph: "S", color: "#ddd4c7", shape: "bone", image: "./assets/cards/skeleton-warrior.png" },
    radius: 17,
  },
  mage: {
    id: "mage",
    name: "Mage",
    type: "unit",
    manaCost: 5,
    hp: 360,
    damage: 108,
    range: 156,
    attackCooldown: 1.35,
    moveSpeed: 35,
    role: "Magic Burst",
    description: "Splash bursts punish clustered attackers.",
    visual: { glyph: "M", color: "#ca8cff", shape: "burst", image: "./assets/cards/arcane-wizard.png" },
    radius: 17,
    splashRadius: 54,
    projectileSpeed: 430,
  },
  giant: {
    id: "giant",
    name: "Golem",
    type: "unit",
    manaCost: 6,
    hp: 1880,
    damage: 118,
    range: 48,
    attackCooldown: 2.55,
    moveSpeed: 22,
    role: "Siege",
    description: "Massive stone bruiser with very slow, crushing pressure.",
    visual: { glyph: "G", color: "#cf75a8", shape: "maul", image: "./assets/cards/golem.png" },
    radius: 28,
  },
  fireball: {
    id: "fireball",
    name: "Fireball",
    type: "spell",
    manaCost: 4,
    hp: 0,
    damage: 250,
    range: 0,
    attackCooldown: 0,
    moveSpeed: 0,
    role: "Spell",
    description: "Area damage anywhere on the battlefield.",
    visual: { glyph: "F", color: "#ff744d", shape: "flame", image: "./assets/cards/fireball.png" },
    radius: 92,
    castleMultiplier: 0.34,
  },
  heal: {
    id: "heal",
    name: "Heal",
    type: "spell",
    manaCost: 3,
    hp: 0,
    damage: 0,
    range: 0,
    attackCooldown: 0,
    moveSpeed: 0,
    role: "Spell",
    description: "Restores friendly units or your castle.",
    visual: { glyph: "H", color: "#73f084", shape: "cross", image: "./assets/cards/heal.png" },
    radius: 108,
    heal: 240,
    castleMultiplier: 0.38,
  },
};

const SHARED_DECK = Object.keys(CARD_LIBRARY);

export const ACTIVE_DECKS = {
  player: [...SHARED_DECK],
  enemy: [...SHARED_DECK],
};

export const CASTLE_ASSETS = {
  player: {
    full: "./assets/castles/player-100.png",
    damaged: "./assets/castles/player-50.png",
    destroyed: "./assets/castles/player-0.png",
  },
  enemy: {
    full: "./assets/castles/enemy-100.png",
    damaged: "./assets/castles/enemy-50.png",
    destroyed: "./assets/castles/enemy-0.png",
  },
};

export const BACKGROUND_ASSET = "./assets/backgrounds/battlefield.png";

const FIRE_KNIGHT_BASE = "./assets/units/fire-knight";
const BARBARIAN_BASE = "./assets/units/barbarian";
const WARRIOR_BASE = "./assets/units/warrior";
const LEAF_RANGER_BASE = "./assets/units/leaf-ranger";
const ARCANE_WIZARD_BASE = "./assets/units/arcane-wizard";
const GOLEM_BASE = "./assets/units/golem";
const BAT_BASE = "./assets/units/bat";
const WOLF_BASE = "./assets/units/wolf";
const SKELETON_WARRIOR_BASE = "./assets/units/skeleton-warrior";
const FIREBALL_EFFECT_BASE = "./assets/effects/fireball";
const HEAL_EFFECT_BASE = "./assets/effects/heal";

function frameSequence(basePath, folder, prefix, count) {
  return Array.from({ length: count }, (_, index) => `${basePath}/${folder}/${prefix}${index + 1}.png`);
}

export const UNIT_SPRITES = {
  warrior: {
    source: { x: 0, y: 0, width: 1014, height: 989 },
    draw: { width: 122, height: 90, feetOffsetY: 4 },
    shadow: { width: 40, height: 11, color: "rgba(0, 0, 0, 0.24)" },
    animations: {
      idle: {
        frames: frameSequence(WARRIOR_BASE, "idle", "idle_", 10),
        frameDuration: 0.1,
        loop: true,
      },
      attack: {
        frames: frameSequence(WARRIOR_BASE, "attack", "attack_", 10),
        frameDuration: 0.07,
        loop: false,
      },
      death: {
        frames: frameSequence(WARRIOR_BASE, "death", "death_", 10),
        frameDuration: 0.09,
        loop: false,
      },
    },
  },
  barbarian: {
    source: { x: 463, y: 211, width: 626, height: 550 },
    draw: { width: 122, height: 90, feetOffsetY: 6 },
    shadow: { width: 42, height: 12, color: "rgba(0, 0, 0, 0.24)" },
    animations: {
      idle: {
        frames: frameSequence(BARBARIAN_BASE, "idle", "idle_", 10),
        frameDuration: 0.11,
        loop: true,
      },
      attack: {
        frames: frameSequence(BARBARIAN_BASE, "attack", "attack_", 10),
        frameDuration: 0.08,
        loop: false,
      },
      death: {
        frames: frameSequence(BARBARIAN_BASE, "death", "death_", 10),
        frameDuration: 0.1,
        loop: false,
      },
    },
  },
  knight: {
    source: { x: 100, y: 44, width: 112, height: 83 },
    draw: { width: 122, height: 90, feetOffsetY: 6 },
    shadow: { width: 48, height: 14, color: "rgba(0, 0, 0, 0.28)" },
    animations: {
      idle: {
        frames: frameSequence(FIRE_KNIGHT_BASE, "idle", "idle_", 8),
        frameDuration: 0.12,
        loop: true,
      },
      attack: {
        frames: frameSequence(FIRE_KNIGHT_BASE, "attack", "1_atk_", 11),
        frameDuration: 0.07,
        loop: false,
      },
      death: {
        frames: frameSequence(FIRE_KNIGHT_BASE, "death", "death_", 13),
        frameDuration: 0.08,
        loop: false,
      },
    },
  },
  archer: {
    source: { x: 118, y: 66, width: 76, height: 61 },
    draw: { width: 122, height: 90, feetOffsetY: 6 },
    shadow: { width: 40, height: 11, color: "rgba(0, 0, 0, 0.24)" },
    animations: {
      idle: {
        frames: frameSequence(LEAF_RANGER_BASE, "idle", "idle_", 12),
        frameDuration: 0.1,
        loop: true,
      },
      attack: {
        frames: frameSequence(LEAF_RANGER_BASE, "attack", "2_atk_", 15),
        frameDuration: 0.06,
        loop: false,
      },
      death: {
        frames: frameSequence(LEAF_RANGER_BASE, "death", "death_", 19),
        frameDuration: 0.07,
        loop: false,
      },
    },
  },
  bat: {
    source: { x: 0, y: 0, width: 64, height: 64 },
    draw: { width: 84, height: 54, feetOffsetY: -4 },
    shadow: { width: 24, height: 6, color: "rgba(0, 0, 0, 0.22)" },
    animations: {
      idle: {
        frames: frameSequence(BAT_BASE, "idle", "idle_", 8),
        frameDuration: 0.08,
        loop: true,
      },
      attack: {
        frames: frameSequence(BAT_BASE, "attack", "attack_", 10),
        frameDuration: 0.06,
        loop: false,
      },
      death: {
        frames: frameSequence(BAT_BASE, "death", "death_", 10),
        frameDuration: 0.07,
        loop: false,
      },
    },
  },
  wolf: {
    source: { x: 0, y: 0, width: 64, height: 64 },
    draw: { width: 84, height: 52, feetOffsetY: 18 },
    shadow: { width: 34, height: 8, color: "rgba(0, 0, 0, 0.2)" },
    animations: {
      idle: {
        frames: frameSequence(WOLF_BASE, "idle", "idle_", 8),
        frameDuration: 0.08,
        loop: true,
      },
      attack: {
        frames: frameSequence(WOLF_BASE, "attack", "attack_", 16),
        frameDuration: 0.055,
        loop: false,
      },
      death: {
        frames: frameSequence(WOLF_BASE, "death", "death_", 18),
        frameDuration: 0.07,
        loop: false,
      },
    },
  },
  skeleton: {
    source: { x: 20, y: 53, width: 97, height: 75 },
    draw: { width: 94, height: 74, feetOffsetY: 1 },
    shadow: { width: 32, height: 8, color: "rgba(0, 0, 0, 0.22)" },
    animations: {
      idle: {
        frames: frameSequence(SKELETON_WARRIOR_BASE, "idle", "idle_", 7),
        frameDuration: 0.09,
        loop: true,
      },
      attack: {
        frames: frameSequence(SKELETON_WARRIOR_BASE, "attack", "attack_", 4),
        frameDuration: 0.08,
        loop: false,
      },
      death: {
        frames: frameSequence(SKELETON_WARRIOR_BASE, "death", "death_", 4),
        frameDuration: 0.12,
        loop: false,
      },
    },
  },
  mage: {
    source: { x: 40, y: 18, width: 150, height: 150 },
    draw: { width: 122, height: 90, feetOffsetY: 18 },
    shadow: { width: 34, height: 10, color: "rgba(0, 0, 0, 0.22)" },
    animations: {
      idle: {
        frames: frameSequence(ARCANE_WIZARD_BASE, "idle", "idle_", 6),
        frameDuration: 0.14,
        loop: true,
      },
      attack: {
        frames: frameSequence(ARCANE_WIZARD_BASE, "attack", "attack_", 8),
        frameDuration: 0.08,
        loop: false,
      },
      death: {
        frames: frameSequence(ARCANE_WIZARD_BASE, "death", "death_", 7),
        frameDuration: 0.11,
        loop: false,
      },
    },
  },
  giant: {
    source: { x: 0, y: 2, width: 64, height: 60 },
    draw: { width: 148, height: 114, feetOffsetY: 36 },
    shadow: { width: 60, height: 18, color: "rgba(0, 0, 0, 0.3)" },
    animations: {
      idle: {
        frames: frameSequence(GOLEM_BASE, "idle", "idle_", 7),
        frameDuration: 0.18,
        loop: true,
      },
      attack: {
        frames: frameSequence(GOLEM_BASE, "attack", "attack_", 9),
        frameDuration: 0.12,
        loop: false,
      },
      death: {
        frames: frameSequence(GOLEM_BASE, "death", "death_", 28),
        frameDuration: 0.075,
        loop: false,
      },
    },
  },
};

export const SPELL_VFX = {
  fireball: {
    projectile: {
      frames: frameSequence(FIREBALL_EFFECT_BASE, "projectile", "projectile_", 6),
      frameDuration: 0.07,
      duration: 0.42,
      draw: { width: 46, height: 46 },
      glowColor: "#ff6d32",
    },
    impact: {
      frames: frameSequence(FIREBALL_EFFECT_BASE, "impact", "impact_", 8),
      frameDuration: 0.05,
      duration: 0.4,
      draw: { width: 124, height: 124 },
      ringColor: "#ff8d55",
      fillColor: "rgba(255, 116, 77, 0.16)",
    },
  },
  heal: {
    projectile: {
      frames: frameSequence(HEAL_EFFECT_BASE, "projectile", "projectile_", 6),
      frameDuration: 0.07,
      duration: 0.42,
      draw: { width: 42, height: 42 },
      glowColor: "#78f5ad",
    },
    impact: {
      frames: frameSequence(HEAL_EFFECT_BASE, "burst", "burst_", 8),
      frameDuration: 0.05,
      duration: 0.4,
      draw: { width: 126, height: 126 },
      ringColor: "#86ff98",
      fillColor: "rgba(134, 255, 152, 0.13)",
    },
  },
};

export function getUnitAnimationDuration(cardId, animationName) {
  const animation = UNIT_SPRITES[cardId]?.animations?.[animationName];
  if (!animation) {
    return 0;
  }
  return animation.frames.length * animation.frameDuration;
}

export const SIDES = {
  player: {
    id: "player",
    direction: 1,
    castleX: 84,
    color: "#4fb06d",
    projectileColor: "#b8f6c4",
  },
  enemy: {
    id: "enemy",
    direction: -1,
    castleX: 1116,
    color: "#d75648",
    projectileColor: "#ffc0b5",
  },
};
