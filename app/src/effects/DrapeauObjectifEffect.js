import { EffectStrategy } from "./EffectStrategy.js";

// Plante le drapeau d'objectif sur un couloir : des lors, le camp qui
// controle ce couloir plusieurs tours cumules remporte la partie
// (voir FlagControlVictoryCondition).
export class DrapeauObjectifEffect extends EffectStrategy {
  apply(ctx) {
    ctx.game.flagLane = ctx.lane;
    ctx.log(`Drapeau d'Objectif place sur le couloir ${ctx.lane}.`);
  }
}
