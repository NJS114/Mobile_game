import { EffectStrategy } from "./EffectStrategy.js";

// Pose un piege partage sur le couloir : la prochaine carte adverse qui
// avance en tranchee->front sur cette ligne subit des degats (voir
// MoveToFrontCommand, qui consulte game.traps).
export class MineEnterreeEffect extends EffectStrategy {
  static DAMAGE = 4;

  apply(ctx) {
    ctx.game.traps[ctx.lane] = { owner: ctx.faction, damage: MineEnterreeEffect.DAMAGE };
    ctx.log(`Mine enterree posee sur le couloir ${ctx.lane}.`);
  }
}
