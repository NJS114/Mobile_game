// Hierarchie des cartes statiques (definition immuable issue de cards-data.js).
// Une Card decrit le "modele" ; CardInstance (voir CardInstance.js) porte
// l'etat mutable d'un exemplaire pose sur le plateau ou en main (deux copies
// de la meme carte peuvent avoir des etats differents).

export class Card {
  constructor(def) {
    this.def = def;
  }

  get id() {
    return this.def.id;
  }

  get nom() {
    return this.def.nom;
  }

  get cout() {
    return this.def.cout;
  }

  get rarete() {
    return this.def.rarete;
  }

  get citation() {
    return this.def.citation ?? "";
  }

  get art() {
    return this.def.art ?? null;
  }
}

export class UnitCard extends Card {
  get tribu() {
    return this.def.tribu;
  }

  get espece() {
    return this.def.espece;
  }

  get attaque() {
    return this.def.attaque;
  }

  get pv() {
    return this.def.pv;
  }

  get motscles() {
    return this.def.motscles ?? [];
  }

  get capacite() {
    return this.def.capacite ?? "";
  }
}

export class SpellCard extends Card {
  get effetId() {
    return this.def.effetId;
  }

  get capacite() {
    return this.def.capacite ?? "";
  }
}
