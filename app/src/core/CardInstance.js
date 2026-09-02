let nextId = 1;

// Un exemplaire pose sur le plateau. Porte l'etat mutable (points de vie
// courants, boucliers, statuts) separement de la Card (definition figee),
// ce qui permet a deux copies de la meme carte d'avoir des etats differents.
export class CardInstance {
  constructor(card, owner) {
    this.instanceId = `ci-${nextId++}`;
    this.card = card;
    this.owner = owner;
    this.currentDefense = card.defense ?? 0;
    this.shieldBonus = 0;
    this.skipNextAttack = false;
    this.ambush = false;
    this.movementBlockedUntilTurn = 0;
    this.revealed = false;
    this.hasAttacked = false;
  }

  get attaque() {
    return this.card.attaque ?? 0;
  }

  get defense() {
    return this.currentDefense + this.shieldBonus;
  }

  isMovementBlocked(currentTurn) {
    return this.movementBlockedUntilTurn > currentTurn;
  }

  // Le bouclier absorbe les degats en premier, puis la reserve de vie reelle.
  receiveDamage(amount) {
    const absorbed = Math.min(this.shieldBonus, amount);
    this.shieldBonus -= absorbed;
    this.currentDefense -= amount - absorbed;
    return this.currentDefense <= 0;
  }

  heal(amount) {
    this.currentDefense = Math.min(this.card.defense, this.currentDefense + amount);
  }

  fullyHeal() {
    this.currentDefense = this.card.defense;
  }
}
