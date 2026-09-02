import { Command } from "./Command.js";

export class DeployCommand extends Command {
  constructor(instanceId) {
    super();
    this.instanceId = instanceId;
  }

  execute(game) {
    const player = game.activePlayer;
    const instance = player.hand.find((c) => c.instanceId === this.instanceId);
    if (!instance || !player.canAfford(instance.card)) return;

    player.spendPR(instance.card.cout);
    player.removeFromHand(this.instanceId);
    player.zones.reserve.push(instance);
    game.log.push(`${game.activeFactionLabel} deploie ${instance.card.nom} en reserve.`);
  }
}
