import { EffectStrategy } from "./EffectStrategy.js";

// Rappelle une carte chat depuis la reserve (elle avance en tranchee) ou
// deja en tranchee, et lui donne un petit bouclier.
export class PeloteLaineEffect extends EffectStrategy {
  static SHIELD = 2;

  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const target = this.recallTarget(ctx.ownLane, targetInstanceId);
    if (!target) {
      ctx.log("Pelote de Laine : cible introuvable.");
      return;
    }
    target.shieldBonus += PeloteLaineEffect.SHIELD;
    ctx.log(`Pelote de Laine : ${target.card.nom} protege (+${PeloteLaineEffect.SHIELD} defense).`);
  }

  recallTarget(laneState, targetInstanceId) {
    const fromReserve = laneState.removeFromReserve(targetInstanceId);
    if (fromReserve) {
      laneState.placeInTranchee(fromReserve);
      return fromReserve;
    }
    return laneState.tranchee.find((c) => c && c.instanceId === targetInstanceId) ?? null;
  }
}
