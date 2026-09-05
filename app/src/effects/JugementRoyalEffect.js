import { EffectStrategy } from "./EffectStrategy.js";
import { Target } from "./TargetRef.js";

export class JugementRoyalEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    if (!context.isEnemy(targetId) || Target.isHero(targetId)) return false;
    const instance = context.findInstance(targetId);
    return !!instance && instance.card.cout <= 3;
  }

  apply(context, targetId) {
    const instance = context.findInstance(targetId);
    context.destroyInstance(targetId);
    context.log(`Jugement Royal detruit ${instance?.card.nom ?? "la cible"}.`);
  }
}
