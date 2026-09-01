import { EffectStrategy } from "./EffectStrategy.js";

// Bloque le deplacement d'une carte ennemie ciblee pendant un tour.
export class BarbelesEffect extends EffectStrategy {
  static BLOCK_TURNS = 1;

  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    const target = ctx.game.players[ctx.enemyFaction].findInstanceAnywhere(targetInstanceId);
    if (!target) {
      ctx.log("Barbeles : cible introuvable.");
      return;
    }
    target.movementBlockedUntilTurn = ctx.game.turn + BarbelesEffect.BLOCK_TURNS;
    ctx.log(`Barbeles : ${target.card.nom} ne peut plus se deplacer ce tour.`);
  }
}
