import { EffectStrategy } from "./EffectStrategy.js";

export class CaisseRavitaillementEffect extends EffectStrategy {
  static HEAL = 3;

  apply(ctx) {
    const target = ctx.ownLane.front;
    if (!target) {
      ctx.log("Caisse de Ravitaillement : aucune carte au front a soigner.");
      return;
    }
    target.heal(CaisseRavitaillementEffect.HEAL);
    ctx.log(`Caisse de Ravitaillement soigne ${target.card.nom} (+${CaisseRavitaillementEffect.HEAL}).`);
  }
}
