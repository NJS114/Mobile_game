import { EffectStrategy } from "./EffectStrategy.js";

export class EclairArcaniqueEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    return context.isEnemy(targetId);
  }

  apply(context, targetId) {
    context.dealDamage(targetId, 3);
    context.log("Eclair Arcanique inflige 3 degats a la cible.");
  }
}
