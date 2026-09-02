import { EffectStrategy } from "./EffectStrategy.js";

// Fait reculer une carte chien ciblee du front vers sa tranchee et lui
// fait perdre son action (elle n'attaquera pas au prochain combat).
export class OsAttractionEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const enemy = ctx.enemyZones;
    const target = enemy.front.find((c) => c.instanceId === targetInstanceId);
    if (!target) {
      ctx.log("Os d'Attraction : cible introuvable au front adverse.");
      return;
    }
    enemy.removeFromFront(target.instanceId);
    target.skipNextAttack = true;
    if (!enemy.placeInTranchee(target)) {
      ctx.log(`Os d'Attraction : tranchee adverse pleine, ${target.card.nom} est simplement stoppe.`);
      return;
    }
    ctx.log(`Os d'Attraction : ${target.card.nom} recule en tranchee et perd son action.`);
  }
}
