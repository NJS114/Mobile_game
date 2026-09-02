import { EffectStrategy } from "./EffectStrategy.js";

// Pose un piege partage : la prochaine carte adverse qui avance en
// tranchee->front subit des degats (voir MoveToFrontCommand, qui
// consulte game.trap).
export class MineEnterreeEffect extends EffectStrategy {
  static DAMAGE = 4;

  apply(ctx) {
    ctx.game.trap = { owner: ctx.faction, damage: MineEnterreeEffect.DAMAGE };
    ctx.log("Mine enterree posee.");
  }
}
