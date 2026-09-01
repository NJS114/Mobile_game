import { OsAttractionEffect } from "./OsAttractionEffect.js";
import { PeloteLaineEffect } from "./PeloteLaineEffect.js";
import { MineEnterreeEffect } from "./MineEnterreeEffect.js";
import { FumigeneEffect } from "./FumigeneEffect.js";
import { BarbelesEffect } from "./BarbelesEffect.js";
import { RepairCommunicationEffect } from "./RepairCommunicationEffect.js";
import { FrappeAerienneEffect } from "./FrappeAerienneEffect.js";
import { DrapeauObjectifEffect } from "./DrapeauObjectifEffect.js";
import { TrousseSecoursEffect } from "./TrousseSecoursEffect.js";
import { SacsDeSableEffect } from "./SacsDeSableEffect.js";
import { CaisseRavitaillementEffect } from "./CaisseRavitaillementEffect.js";

// Registre (Strategy + petit Service Locator) : associe l'id d'une carte
// objet a l'instance de strategie qui sait l'appliquer. Ajouter une carte
// objet ne demande qu'une ligne ici, jamais de toucher au moteur.
export class EffectRegistry {
  constructor() {
    this.strategies = new Map();
  }

  register(cardId, strategy) {
    this.strategies.set(cardId, strategy);
    return this;
  }

  get(cardId) {
    return this.strategies.get(cardId) ?? null;
  }

  static buildDefault() {
    const repairComm = new RepairCommunicationEffect();
    return new EffectRegistry()
      .register("os-attraction", new OsAttractionEffect())
      .register("pelote-laine", new PeloteLaineEffect())
      .register("mine-enterree", new MineEnterreeEffect())
      .register("fumigene", new FumigeneEffect())
      .register("barbeles", new BarbelesEffect())
      .register("radio-campagne", repairComm)
      .register("cable-campagne", repairComm)
      .register("frappe-aerienne", new FrappeAerienneEffect())
      .register("drapeau-objectif", new DrapeauObjectifEffect())
      .register("trousse-secours", new TrousseSecoursEffect())
      .register("sacs-de-sable", new SacsDeSableEffect())
      .register("caisse-ravitaillement", new CaisseRavitaillementEffect());
  }
}
