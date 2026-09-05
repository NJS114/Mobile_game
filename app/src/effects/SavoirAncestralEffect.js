import { EffectStrategy } from "./EffectStrategy.js";

export class SavoirAncestralEffect extends EffectStrategy {
  apply(context) {
    context.drawCards(context.casterId, 2);
    context.log("Savoir Ancestral fait piocher 2 cartes.");
  }
}
