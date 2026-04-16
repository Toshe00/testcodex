import { CARD_LIBRARY } from "./data.js";

export class DeckCycle {
  constructor(cardIds, random = Math.random) {
    this.cardIds = [...cardIds];
    this.random = random;
    this.reset();
  }

  reset() {
    const shuffled = shuffle([...this.cardIds], this.random);
    this.hand = shuffled.slice(0, 5);
    this.queue = shuffled.slice(5);
  }

  getCard(index) {
    return CARD_LIBRARY[this.hand[index]];
  }

  getNextCard() {
    return CARD_LIBRARY[this.queue[0]];
  }

  canPlay(index) {
    return index >= 0 && index < this.hand.length;
  }

  play(index) {
    if (!this.canPlay(index)) {
      return null;
    }
    const [played] = this.hand.splice(index, 1);
    const next = this.queue.shift();
    if (next) {
      this.hand.push(next);
    }
    this.queue.push(played);
    return CARD_LIBRARY[played];
  }
}

export function createCardView(card, options = {}) {
  const root = document.createElement("article");
  root.className = "card";
  root.dataset.cardId = card.id;
  root.style.setProperty("--accent", card.visual.color);
  if (options.disabled) {
    root.classList.add("disabled");
  } else {
    root.classList.add("playable");
  }
  const visualMarkup = card.visual.image
    ? `<img class="card-visual-image" src="${card.visual.image}" alt="" draggable="false">`
    : card.visual.glyph;
  root.innerHTML = `
    <div class="card-head">
      <span class="card-name">${card.name}</span>
      <span class="card-cost">${card.manaCost}</span>
    </div>
    <div class="card-visual${card.visual.image ? " has-image" : ""}">${visualMarkup}</div>
    <div>
      <div class="card-role">${card.role}</div>
      <div class="card-desc">${card.description}</div>
    </div>
  `;
  return root;
}

export function shuffle(items, random = Math.random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
