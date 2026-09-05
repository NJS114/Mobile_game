let nextId = 1;

// Un exemplaire en main ou pose sur le plateau. Porte l'etat mutable
// (points de vie courants, bonus de synergie, buffs de sorts, mots-cles
// accordes en jeu) separement de la Card (definition figee), ce qui permet
// a deux copies de la meme carte d'avoir des etats differents.
export class CardInstance {
  constructor(card, ownerId) {
    this.instanceId = `ci-${nextId++}`;
    this.card = card;
    this.ownerId = ownerId;

    this.currentPv = card.pv ?? 0;
    this.bonusAtq = 0; // recalcule a chaque changement de plateau (synergies de tribu)
    this.buffAtq = 0; // permanent, accorde par un sort
    this.buffPv = 0; // permanent, accorde par un sort
    this.hasDivineShield = card.motscles?.includes("bouclier") ?? false;
    this.grantedKeywords = new Set();

    this.hasAttacked = false;
    this.summoningSick = true;

    // Statuts generiques (accordes par des sorts) : etourdi bloque l'attaque
    // pendant N tours, poison inflige des degats a chaque debut de tour du
    // controleur tant qu'il n'est pas soigne.
    this.stunTurns = 0;
    this.poisonPerTurn = 0;
  }

  get atq() {
    return Math.max(0, (this.card.attaque ?? 0) + this.bonusAtq + this.buffAtq);
  }

  get maxPv() {
    return (this.card.pv ?? 0) + this.buffPv;
  }

  hasKeyword(word) {
    return (this.card.motscles ?? []).includes(word) || this.grantedKeywords.has(word);
  }

  get isTaunt() {
    return this.hasKeyword("garde");
  }

  get isCharge() {
    return this.hasKeyword("charge");
  }

  grantKeyword(word) {
    this.grantedKeywords.add(word);
  }

  applyBuff({ atq = 0, pv = 0 }) {
    this.buffAtq += atq;
    if (pv) {
      this.buffPv += pv;
      this.currentPv += pv;
    }
  }

  // Remise a zero avant chaque recalcul de synergie de tribu (voir
  // SynergyResolver) : le bonus de synergie n'est jamais cumule d'un
  // recalcul a l'autre, il est toujours reconstruit depuis l'etat courant.
  resetSynergyBonus() {
    this.bonusAtq = 0;
  }

  canAttack() {
    return !this.hasAttacked && !this.summoningSick && this.stunTurns <= 0;
  }

  applyStun(turns) {
    this.stunTurns = Math.max(this.stunTurns, turns);
  }

  applyPoison(amountPerTurn) {
    this.poisonPerTurn += amountPerTurn;
  }

  // Appele une fois par tour pour le controleur de cette instance : fait
  // s'ecouler l'etourdissement et inflige les degats de poison. Renvoie
  // true si le poison vient de detruire l'unite (a l'appelant de la
  // retirer du plateau, voir Game.applyStartOfTurnStatuses).
  tickStatusesForNewTurn() {
    if (this.stunTurns > 0) this.stunTurns -= 1;
    if (this.poisonPerTurn > 0) return this.receiveDamage(this.poisonPerTurn);
    return false;
  }

  // Le bouclier divin absorbe integralement le premier coup puis disparait.
  receiveDamage(amount) {
    if (this.hasDivineShield && amount > 0) {
      this.hasDivineShield = false;
      return false;
    }
    this.currentPv -= amount;
    return this.currentPv <= 0;
  }

  heal(amount) {
    this.currentPv = Math.min(this.maxPv, this.currentPv + amount);
  }
}
