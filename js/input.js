import { createCardView } from "./cards.js";
import { CARD_LIBRARY, WORLD } from "./data.js";
import { getDeploymentZone, rectContains } from "./game.js";

export class InputController {
  constructor(game, canvas, ui) {
    this.game = game;
    this.canvas = canvas;
    this.ui = ui;
    this.drag = null;
    this.bind();
  }

  bind() {
    this.ui.hand.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    window.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("pointercancel", () => this.cancelDrag());
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    });
  }

  onPointerDown(event) {
    const cardEl = event.target.closest(".card");
    if (!cardEl || cardEl.classList.contains("disabled")) {
      return;
    }
    const index = Number(cardEl.dataset.index);
    const card = this.game.state.player.deck.getCard(index);
    if (!card || this.game.state.player.mana < card.manaCost) {
      return;
    }

    try {
      cardEl.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic pointer events in automated tests do not always create an active pointer capture.
    }
    this.drag = {
      index,
      card,
      source: cardEl,
      valid: false,
    };
    cardEl.classList.add("dragging");
    this.showGhost(card, event.clientX, event.clientY);
    this.updateDrag(event);
  }

  onPointerMove(event) {
    if (!this.drag) {
      return;
    }
    this.updateDrag(event);
  }

  onPointerUp(event) {
    if (!this.drag) {
      return;
    }
    const point = this.clientToWorld(event.clientX, event.clientY);
    const source = this.drag.source;
    const result = this.game.playCard("player", this.drag.index, point);
    this.cancelDrag();
    if (!result.ok) {
      source.classList.add("invalid-pulse");
      window.setTimeout(() => source.classList.remove("invalid-pulse"), 280);
    }
  }

  updateDrag(event) {
    const point = this.clientToWorld(event.clientX, event.clientY);
    const valid = this.game.isValidPlay("player", this.drag.card, point);
    this.drag.valid = valid;
    this.game.state.drag = {
      cardId: this.drag.card.id,
      type: this.drag.card.type,
      point,
      valid,
    };
    this.ui.dragGhost.style.left = `${event.clientX}px`;
    this.ui.dragGhost.style.top = `${event.clientY}px`;
    this.ui.dropMessage.classList.remove("hidden", "valid", "invalid");
    this.ui.dropMessage.classList.add(valid ? "valid" : "invalid");
    this.ui.dropMessage.textContent = valid ? "Release to deploy" : invalidMessage(this.drag.card);
  }

  cancelDrag() {
    if (!this.drag) {
      return;
    }
    this.drag.source.classList.remove("dragging");
    this.drag = null;
    this.game.state.drag = null;
    this.ui.dragGhost.classList.add("hidden");
    this.ui.dragGhost.innerHTML = "";
    this.ui.dropMessage.classList.add("hidden");
  }

  showGhost(card, x, y) {
    this.ui.dragGhost.innerHTML = "";
    this.ui.dragGhost.appendChild(createCardView(card));
    this.ui.dragGhost.classList.remove("hidden");
    this.ui.dragGhost.style.left = `${x}px`;
    this.ui.dragGhost.style.top = `${y}px`;
  }

  clientToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * WORLD.width,
      y: ((clientY - rect.top) / rect.height) * WORLD.height,
    };
  }
}

export function buildHand(ui, game) {
  ui.hand.innerHTML = "";
  game.state.player.deck.hand.forEach((cardId, index) => {
    const card = CARD_LIBRARY[cardId];
    const disabled = game.state.player.mana < card.manaCost || game.state.mode !== "playing";
    const cardEl = createCardView(card, { disabled });
    cardEl.dataset.index = String(index);
    cardEl.setAttribute("aria-disabled", String(disabled));
    ui.hand.appendChild(cardEl);
  });

  ui.nextCard.innerHTML = "";
  const next = game.state.player.deck.getNextCard();
  if (next) {
    const view = createCardView(next);
    view.classList.add("next-card");
    ui.nextCard.appendChild(view);
  }
}

export function getDragValidity(game) {
  const drag = game.state.drag;
  if (!drag) {
    return null;
  }
  if (drag.type === "unit") {
    return {
      zone: getDeploymentZone("player"),
      valid: rectContains(getDeploymentZone("player"), drag.point),
    };
  }
  if (drag.cardId === "fireball") {
    return {
      zone: WORLD.spellTargetArea,
      valid: rectContains(WORLD.spellTargetArea, drag.point),
    };
  }
  return {
    zone: WORLD.battlefield,
    valid: rectContains(WORLD.battlefield, drag.point),
  };
}

function invalidMessage(card) {
  if (card.type === "unit") {
    return "Deploy units inside the left glowing zone";
  }
  if (card.id === "fireball") {
    return "Target anywhere in the combat view";
  }
  return "Target the battlefield or your castle";
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
