import {
  HERO_HP_INITIAL,
  MANA_INITIAL,
  MANA_MAX,
  BOARD_CAPACITY,
  HAND_CAPACITY,
  STARTING_HAND_SIZE,
} from "../constants.js";

export class Player {
  constructor(id, deck) {
    this.id = id;
    this.deck = deck;
    this.hand = [];
    this.board = [];
    this.hp = HERO_HP_INITIAL;
    this.manaCap = MANA_INITIAL;
    this.mana = MANA_INITIAL;
    this.hasPlayedATurn = false;
    this.drawMany(STARTING_HAND_SIZE);
  }

  drawOne() {
    if (this.deck.isEmpty) return;
    const card = this.deck.draw();
    if (this.hand.length >= HAND_CAPACITY) return;
    this.hand.push(card);
  }

  drawMany(amount) {
    for (let i = 0; i < amount; i++) this.drawOne();
  }

  gainManaCapacity(amount = 1) {
    this.manaCap = Math.min(MANA_MAX, this.manaCap + amount);
  }

  refillMana() {
    this.mana = this.manaCap;
  }

  canAfford(card) {
    return this.mana >= card.cout;
  }

  spendMana(amount) {
    this.mana -= amount;
  }

  removeFromHand(instanceId) {
    const index = this.hand.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return null;
    return this.hand.splice(index, 1)[0];
  }

  hasFreeBoardSlot() {
    return this.board.length < BOARD_CAPACITY;
  }

  addToBoard(instance) {
    if (!this.hasFreeBoardSlot()) return false;
    this.board.push(instance);
    return true;
  }

  removeFromBoard(instanceId) {
    const index = this.board.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return null;
    return this.board.splice(index, 1)[0];
  }

  findInstanceAnywhere(instanceId) {
    return (
      this.board.find((c) => c.instanceId === instanceId) ??
      this.hand.find((c) => c.instanceId === instanceId) ??
      null
    );
  }

  resetAttacksForNewTurn() {
    for (const unit of this.board) {
      unit.hasAttacked = false;
      unit.summoningSick = false;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
  }

  heal(amount) {
    this.hp = Math.min(HERO_HP_INITIAL, this.hp + amount);
  }

  isDefeated() {
    return this.hp <= 0;
  }
}
