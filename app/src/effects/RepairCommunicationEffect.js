import { EffectStrategy } from "./EffectStrategy.js";

// Radio de Campagne et Cable de Campagne partagent le meme effet :
// reparer la communication d'un couloir.
export class RepairCommunicationEffect extends EffectStrategy {
  apply(ctx) {
    ctx.game.comm.repair(ctx.lane);
    ctx.log(`${ctx.cardDef.nom} repare la communication du couloir ${ctx.lane}.`);
  }
}
