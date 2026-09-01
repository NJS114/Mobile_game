import { EffectStrategy } from "./EffectStrategy.js";

export class TrousseSecoursEffect extends EffectStrategy {
  apply(ctx) {
    const target = ctx.ownLane.front;
    if (!target) {
      ctx.log("Trousse de Secours : aucune carte au front a soigner.");
      return;
    }
    target.fullyHeal();
    ctx.log(`Trousse de Secours soigne completement ${target.card.nom}.`);
  }
}
