import { EffectStrategy } from "./EffectStrategy.js";

export class SacsDeSableEffect extends EffectStrategy {
  static BONUS = 2;

  apply(ctx) {
    const target = ctx.ownLane.front;
    if (!target) {
      ctx.log("Sacs de Sable : aucune carte au front a proteger.");
      return;
    }
    target.shieldBonus += SacsDeSableEffect.BONUS;
    ctx.log(`Sacs de Sable : +${SacsDeSableEffect.BONUS} defense pour ${target.card.nom}.`);
  }
}
