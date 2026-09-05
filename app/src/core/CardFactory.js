import { UnitCard, SpellCard } from "./Card.js";

// Factory Pattern : centralise la construction des Card a partir des
// definitions brutes de cards-data.js, pour que le reste du code n'ait
// jamais a savoir comment un champ "type" du JSON devient une classe.
export class CardFactory {
  static fromDef(def) {
    switch (def.type) {
      case "unite":
        return new UnitCard(def);
      case "sort":
        return new SpellCard(def);
      default:
        throw new Error(`Type de carte inconnu: ${def.type}`);
    }
  }

  static buildCatalog(cardsData) {
    const catalog = new Map();
    for (const def of cardsData.cartes) {
      catalog.set(def.id, CardFactory.fromDef(def));
    }
    return catalog;
  }
}
