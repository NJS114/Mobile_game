import { EffectStrategy } from "./EffectStrategy.js";

// Bloque les attaques a distance (Frappe Aerienne) sur ce couloir pendant
// le tour en cours et le suivant.
export class FumigeneEffect extends EffectStrategy {
  apply(ctx) {
    ctx.game.smokeUntil[ctx.lane] = ctx.game.turn + 1;
    ctx.log(`Fumigene pose sur ${ctx.lane} : attaques a distance bloquees.`);
  }
}
