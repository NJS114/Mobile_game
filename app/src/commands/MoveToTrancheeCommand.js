import { Command } from "./Command.js";

export class MoveToTrancheeCommand extends Command {
  constructor(instanceId, lane) {
    super();
    this.instanceId = instanceId;
    this.lane = lane;
  }

  execute(game) {
    if (!game.comm.isActive(this.lane)) {
      game.log.push("Communication coupee : deplacement impossible sur cette ligne.");
      return;
    }
    const laneState = game.activePlayer.lanes[this.lane];
    const instance = laneState.removeFromReserve(this.instanceId);
    if (!instance) return;

    if (instance.isMovementBlocked(game.turn)) {
      game.log.push(`${instance.card.nom} est immobilise par des barbeles.`);
      laneState.reserve.push(instance);
      return;
    }
    if (!laneState.placeInTranchee(instance)) {
      game.log.push("Tranchee pleine sur cette ligne.");
      laneState.reserve.push(instance);
      return;
    }
    game.log.push(`${game.activeFactionLabel} avance ${instance.card.nom} en tranchee (${this.lane}).`);
  }
}
