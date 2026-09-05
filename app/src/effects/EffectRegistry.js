import { SoinLegereEffect } from "./SoinLegereEffect.js";
import { EclairArcaniqueEffect } from "./EclairArcaniqueEffect.js";
import { SavoirAncestralEffect } from "./SavoirAncestralEffect.js";
import { RangSerreEffect } from "./RangSerreEffect.js";
import { JugementRoyalEffect } from "./JugementRoyalEffect.js";
import { EtourdissementEffect } from "./EtourdissementEffect.js";
import { PoisonSournoisEffect } from "./PoisonSournoisEffect.js";

// Registre (Strategy + petit Service Locator) : associe l'effetId d'une
// carte sort a l'instance de strategie qui sait l'appliquer. Ajouter un
// sort ne demande qu'une ligne ici, jamais de toucher au moteur.
export class EffectRegistry {
  constructor() {
    this.strategies = new Map();
  }

  register(effetId, strategy) {
    this.strategies.set(effetId, strategy);
    return this;
  }

  get(effetId) {
    return this.strategies.get(effetId) ?? null;
  }

  static buildDefault() {
    return new EffectRegistry()
      .register("soin-leger", new SoinLegereEffect())
      .register("eclair-arcanique", new EclairArcaniqueEffect())
      .register("savoir-ancestral", new SavoirAncestralEffect())
      .register("rang-serre", new RangSerreEffect())
      .register("jugement-royal", new JugementRoyalEffect())
      .register("etourdissement", new EtourdissementEffect())
      .register("poison-sournois", new PoisonSournoisEffect());
  }
}
