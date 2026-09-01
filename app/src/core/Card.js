// Hierarchie des cartes statiques (definition immuable issue de cards-data.js).
// Une Card decrit le "modele" ; CardInstance (voir CardInstance.js) porte l'etat
// mutable d'un exemplaire pose sur le plateau (deux joueurs peuvent avoir la
// meme Card en double dans leur deck).

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

  get faction() {
    return this.def.faction;
  }

  get rarete() {
    return this.def.rarete;
  }

  get art() {
    return this.def.art ?? null;
  }
}

export class UnitCard extends Card {
  get attaque() {
    return this.def.attaque;
  }

  get defense() {
    return this.def.defense;
  }

  get role() {
    return this.def.role;
  }

  get trait() {
    return this.def.trait;
  }

  isSapeur() {
    return this.role === "sapeur";
  }
}

export class VehicleCard extends UnitCard {}

export class ObjectCard extends Card {
  get effet() {
    return this.def.effet;
  }
}
