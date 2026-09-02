import { Command } from "./Command.js";

export class MoveToTrancheeCommand extends Command {
  constructor(instanceId) {
    super();
    this.instanceId = instanceId;
  }

  execute(game) {
    if (!game.comm.isActive()) {
      game.log.push("Communication coupee : deplacement impossible.");
      return;
    }
    const zones = game.activePlayer.zones;
    const instance = zones.removeFromReserve(this.instanceId);
    if (!instance) return;

    if (instance.isMovementBlocked(game.turn)) {
      game.log.push(`${instance.card.nom} est immobilise par des barbeles.`);
      zones.reserve.push(instance);
      return;
    }
    if (!zones.placeInTranchee(instance)) {
      game.log.push("Tranchee pleine.");
      zones.reserve.push(instance);
      return;
    }
    game.log.push(`${game.activeFactionLabel} avance ${instance.card.nom} en tranchee.`);
  }
}
