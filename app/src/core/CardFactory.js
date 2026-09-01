import { UnitCard, ObjectCard, VehicleCard } from "./Card.js";

// Factory Pattern : centralise la construction des Card a partir des
// definitions brutes de cards-data.js, pour que le reste du code n'ait
// jamais a savoir comment une categorie JSON devient une classe.
export class CardFactory {
  static fromDef(def, category) {
    switch (category) {
      case "unites":
        return new UnitCard(def);
      case "vehicules":
        return new VehicleCard(def);
      case "objets":
        return new ObjectCard(def);
      default:
        throw new Error(`Categorie de carte inconnue: ${category}`);
    }
  }

  static buildCatalog(cardsData) {
    const catalog = new Map();
    for (const category of ["unites", "objets", "vehicules"]) {
      for (const def of cardsData[category]) {
        catalog.set(def.id, CardFactory.fromDef(def, category));
      }
    }
    return catalog;
  }
}
