import { BALANCE, CARD_LIBRARY, WORLD } from "./data.js";
import { Game } from "./game.js";
import { buildHand, InputController } from "./input.js";
import { Renderer } from "./render.js";

const canvas = document.getElementById("gameCanvas");
const ui = {
  hand: document.getElementById("hand"),
  nextCard: document.getElementById("nextCard"),
  manaText: document.getElementById("manaText"),
  manaSteps: document.getElementById("manaSteps"),
  playerHpFill: document.getElementById("playerHpFill"),
  enemyHpFill: document.getElementById("enemyHpFill"),
  playerHpText: document.getElementById("playerHpText"),
  enemyHpText: document.getElementById("enemyHpText"),
  matchTimer: document.getElementById("matchTimer"),
  endOverlay: document.getElementById("endOverlay"),
  endTitle: document.getElementById("endTitle"),
  endDetail: document.getElementById("endDetail"),
  endEyebrow: document.getElementById("endEyebrow"),
  restartButton: document.getElementById("restartButton"),
  dragGhost: document.getElementById("dragGhost"),
  dropMessage: document.getElementById("dropMessage"),
};
const manaStepNodes = [];

canvas.width = WORLD.width;
canvas.height = WORLD.height;

initManaHud();

const game = new Game();
const renderer = new Renderer(canvas, game);
new InputController(game, canvas, ui);

let previousHandKey = "";
let previousPlayableKey = "";
let previousRevision = -1;

game.subscribe((state) => {
  updateHud(state);
});

ui.restartButton.addEventListener("click", () => {
  game.reset();
});

let last = performance.now();
let accumulator = 0;
const step = 1 / 60;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  accumulator += dt;
  while (accumulator >= step) {
    game.update(step);
    accumulator -= step;
  }
  renderer.render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    game.update(1 / 60);
  }
  renderer.render();
};

window.render_game_to_text = () => game.renderTextState();

function updateHud(state) {
  const playerCastleRatio = state.player.castle.hp / state.player.castle.maxHp;
  const enemyCastleRatio = state.enemy.castle.hp / state.enemy.castle.maxHp;
  ui.playerHpFill.style.width = `${Math.max(0, playerCastleRatio * 100)}%`;
  ui.enemyHpFill.style.width = `${Math.max(0, enemyCastleRatio * 100)}%`;
  ui.playerHpText.textContent = `${Math.ceil(state.player.castle.hp)} / ${state.player.castle.maxHp}`;
  ui.enemyHpText.textContent = `${Math.ceil(state.enemy.castle.hp)} / ${state.enemy.castle.maxHp}`;
  updateManaHud(state.player.mana);
  ui.matchTimer.textContent = formatTime(state.elapsed);

  const handKey = state.player.deck.hand.join("|");
  const playableKey = state.player.deck.hand
    .map((id) => `${id}:${state.player.mana >= CARD_LIBRARY[id].manaCost}`)
    .join("|");
  const shouldRebuildHand = handKey !== previousHandKey
    || playableKey !== previousPlayableKey
    || state.revision !== previousRevision
    || state.mode !== "playing";
  if (!state.drag && shouldRebuildHand) {
    previousHandKey = handKey;
    previousPlayableKey = playableKey;
    previousRevision = state.revision;
    buildHand(ui, game);
  }

  if (state.mode === "won" || state.mode === "lost") {
    ui.endOverlay.classList.remove("hidden");
    ui.endEyebrow.textContent = state.mode === "won" ? "Battle Won" : "Castle Lost";
    ui.endTitle.textContent = state.mode === "won" ? "Victory" : "Defeat";
    ui.endDetail.textContent = state.mode === "won"
      ? "The enemy castle has fallen."
      : "Your castle has been destroyed.";
  } else {
    ui.endOverlay.classList.add("hidden");
  }
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60).toString().padStart(2, "0");
  const secs = (total % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function initManaHud() {
  ui.manaSteps.innerHTML = "";
  manaStepNodes.length = 0;
  for (let manaValue = 1; manaValue <= BALANCE.maxMana; manaValue += 1) {
    const node = document.createElement("div");
    node.className = "mana-step";
    node.textContent = `${manaValue}`;
    ui.manaSteps.append(node);
    manaStepNodes.push(node);
  }
}

function updateManaHud(mana) {
  const fullMana = Math.floor(mana);
  const charge = mana - fullMana;
  ui.manaText.textContent = `${fullMana} / ${BALANCE.maxMana}`;

  manaStepNodes.forEach((node, index) => {
    const manaValue = index + 1;
    const isActive = manaValue <= fullMana;
    const isCharging = manaValue === fullMana + 1 && fullMana < BALANCE.maxMana && charge > 0;
    node.classList.toggle("active", isActive);
    node.classList.toggle("charging", isCharging);
    node.style.setProperty("--charge", isCharging ? charge.toFixed(3) : "0");
  });
}
