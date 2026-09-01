import { EffectStrategy } from "./EffectStrategy.js";

// Fait reculer une carte chien du front vers sa tranchee et lui fait
// perdre son action (elle n'attaquera pas au prochain combat).
export class OsAttractionEffect extends EffectStrategy {
  requiresTarget() {
    return true;
  }

  apply(ctx) {
    const enemy = ctx.enemyLane;
    if (!enemy.front) {
      ctx.log("Os d'Attraction : aucune cible au front adverse.");
      return;
    }
    const target = enemy.front;
    if (!enemy.placeInTranchee(target)) {
      ctx.log(`Os d'Attraction : tranchee adverse pleine, ${target.card.nom} est simplement stoppe.`);
      target.skipNextAttack = true;
      return;
    }
    enemy.front = null;
    target.skipNextAttack = true;
    ctx.log(`Os d'Attraction : ${target.card.nom} recule en tranchee et perd son action.`);
  }
}
