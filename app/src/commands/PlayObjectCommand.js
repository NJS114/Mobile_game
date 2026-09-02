import { Command } from "./Command.js";
import { EffectContext } from "../effects/EffectContext.js";

export class PlayObjectCommand extends Command {
  constructor(instanceId, targetInstanceId = null) {
    super();
    this.instanceId = instanceId;
    this.targetInstanceId = targetInstanceId;
  }

  execute(game) {
    const player = game.activePlayer;
    const instance = player.hand.find((c) => c.instanceId === this.instanceId);
    if (!instance || !player.canAfford(instance.card)) return;

    const strategy = game.effects.get(instance.card.id);
    if (!strategy) {
      game.log.push(`${instance.card.nom} n'a pas d'effet implemente dans ce prototype.`);
      return;
    }

    player.spendPR(instance.card.cout);
    player.removeFromHand(this.instanceId);
    const context = new EffectContext({ game, faction: game.active, cardDef: instance.card });
    strategy.apply(context, this.targetInstanceId);
  }
}
