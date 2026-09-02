import { EffectStrategy } from "./EffectStrategy.js";

// Bloque les attaques a distance (Frappe Aerienne) pendant le tour en
// cours et le suivant.
export class FumigeneEffect extends EffectStrategy {
  apply(ctx) {
    ctx.game.smokeUntil = ctx.game.turn + 1;
    ctx.log("Fumigene pose : attaques a distance bloquees.");
  }
}
