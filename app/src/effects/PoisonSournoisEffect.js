import { EffectStrategy } from "./EffectStrategy.js";
import { Target } from "./TargetRef.js";

export class PoisonSournoisEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    return context.isEnemy(targetId) && !Target.isHero(targetId);
  }

  apply(context, targetId) {
    const instance = context.findInstance(targetId);
    if (!instance) return;
    instance.applyPoison(2);
    context.log(`${instance.card.nom} est empoisonne (2 degats a chaque debut de tour).`);
  }
}
