export class Deck {
  constructor(cards) {
    this.cards = cards;
  }

  static shuffled(cards, rng = Math.random) {
    const shuffled = cards.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return new Deck(shuffled);
  }

  draw() {
    return this.cards.shift() ?? null;
  }

  get isEmpty() {
    return this.cards.length === 0;
  }

  get size() {
    return this.cards.length;
  }
}
