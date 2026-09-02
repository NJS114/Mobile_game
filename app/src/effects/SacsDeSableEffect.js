import { EffectStrategy } from "./EffectStrategy.js";

export class SacsDeSableEffect extends EffectStrategy {
  static BONUS = 2;

  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const target = ctx.ownZones.front.find((c) => c.instanceId === targetInstanceId);
    if (!target) {
      ctx.log("Sacs de Sable : cible introuvable au front.");
      return;
    }
    target.shieldBonus += SacsDeSableEffect.BONUS;
    ctx.log(`Sacs de Sable : +${SacsDeSableEffect.BONUS} defense pour ${target.card.nom}.`);
  }
}
