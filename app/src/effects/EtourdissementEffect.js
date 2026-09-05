import { EffectStrategy } from "./EffectStrategy.js";
import { Target } from "./TargetRef.js";

export class EtourdissementEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    return context.isEnemy(targetId) && !Target.isHero(targetId);
  }

  apply(context, targetId) {
    const instance = context.findInstance(targetId);
    if (!instance) return;
    instance.applyStun(1);
    context.log(`${instance.card.nom} est etourdi et ne pourra pas attaquer a son prochain tour.`);
  }
}
