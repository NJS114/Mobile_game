import { PlayerZones } from "./PlayerZones.js";

export class Player {
  static PR_INITIAL = 3;
  static PR_CAP = 10;
  static MORAL_INITIAL = 20;
  static HAND_SIZE = 5;

  constructor(faction, deck) {
    this.faction = faction;
    this.deck = deck;
    this.hand = [];
    this.pr = Player.PR_INITIAL;
    this.moral = Player.MORAL_INITIAL;
    this.zones = new PlayerZones();
    this.drawUpTo();
  }

  drawUpTo(size = Player.HAND_SIZE) {
    while (this.hand.length < size && !this.deck.isEmpty) {
      this.hand.push(this.deck.draw());
    }
  }

  gainPR(amount = 1) {
    this.pr = Math.min(Player.PR_CAP, this.pr + amount);
  }

  canAfford(card) {
    return this.pr >= card.cout;
  }

  spendPR(amount) {
    this.pr -= amount;
  }

  removeFromHand(instanceId) {
    const index = this.hand.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return null;
    return this.hand.splice(index, 1)[0];
  }

  findInstanceAnywhere(instanceId) {
    return this.zones.findAnywhere(instanceId);
  }

  resetAttacksForNewTurn() {
    for (const instance of this.zones.front) instance.hasAttacked = false;
  }

  isDefeated() {
    return this.moral <= 0;
  }
}
