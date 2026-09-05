import { EffectStrategy } from "./EffectStrategy.js";
import { Target } from "./TargetRef.js";

export class RangSerreEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    return context.isAlly(targetId) && !Target.isHero(targetId);
  }

  apply(context, targetId) {
    const instance = context.findInstance(targetId);
    if (!instance) return;
    instance.applyBuff({ pv: 2 });
    instance.grantKeyword("garde");
    context.log(`${instance.card.nom} gagne Garde et +2 PV grace a Rang Serre.`);
  }
}
