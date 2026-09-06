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
    this.guaranteeAffordableOpeningCard();
  }

  // Avec 1 mana de depart et un deck ou la plupart des cartes coutent plus
  // cher, une main de depart entierement injouable arrive tres souvent par
  // pur hasard - une experience qui se lit comme un bug plutot que comme de
  // la malchance. On garantit donc qu'au moins une carte de la main de
  // depart est jouable des le tour 1, en l'echangeant contre la carte la
  // moins chere disponible dans la pioche si besoin.
  guaranteeAffordableOpeningCard() {
    if (this.hand.some((c) => this.canAfford(c.card))) return;
    const affordableIndex = this.deck.cards.findIndex((c) => this.canAfford(c.card));
    if (affordableIndex === -1) return;
    const priciestIndex = this.hand.reduce(
      (maxI, c, i, arr) => (c.card.cout > arr[maxI].card.cout ? i : maxI),
      0
    );
    const [affordableCard] = this.deck.cards.splice(affordableIndex, 1);
    const [priciestCard] = this.hand.splice(priciestIndex, 1, affordableCard);
    this.deck.cards.push(priciestCard);
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
    return this.addToBoardAt(instance, this.board.length);
  }

  // Permet de choisir ou l'unite arrive dans la ligne (avant une unite
  // existante, ou en bout de ligne) plutot que de toujours l'ajouter a la
  // fin - le plateau reste une liste compacte (pas de "trous"), l'index
  // choisi n'est donc qu'une position relative parmi les unites en jeu.
  addToBoardAt(instance, index) {
    if (!this.hasFreeBoardSlot()) return false;
    const clamped = Math.max(0, Math.min(index, this.board.length));
    this.board.splice(clamped, 0, instance);
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
