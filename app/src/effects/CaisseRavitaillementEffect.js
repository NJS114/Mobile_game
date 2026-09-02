import { EffectStrategy } from "./EffectStrategy.js";

export class CaisseRavitaillementEffect extends EffectStrategy {
  static HEAL = 3;

  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const target = ctx.ownZones.front.find((c) => c.instanceId === targetInstanceId);
    if (!target) {
      ctx.log("Caisse de Ravitaillement : cible introuvable au front.");
      return;
    }
    target.heal(CaisseRavitaillementEffect.HEAL);
    ctx.log(`Caisse de Ravitaillement soigne ${target.card.nom} (+${CaisseRavitaillementEffect.HEAL}).`);
  }
}
