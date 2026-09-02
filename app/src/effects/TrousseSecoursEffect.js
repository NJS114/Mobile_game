import { EffectStrategy } from "./EffectStrategy.js";

export class TrousseSecoursEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const target = ctx.ownZones.front.find((c) => c.instanceId === targetInstanceId);
    if (!target) {
      ctx.log("Trousse de Secours : cible introuvable au front.");
      return;
    }
    target.fullyHeal();
    ctx.log(`Trousse de Secours soigne completement ${target.card.nom}.`);
  }
}
