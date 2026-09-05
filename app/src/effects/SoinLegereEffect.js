import { EffectStrategy } from "./EffectStrategy.js";

export class SoinLegereEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  isValidTarget(context, targetId) {
    return context.isAlly(targetId);
  }

  apply(context, targetId) {
    context.heal(targetId, 3);
    context.log("Benediction Legere rend 3 PV a la cible.");
  }
}
