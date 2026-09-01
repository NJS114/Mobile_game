import { Command } from "./Command.js";

export class MoveToFrontCommand extends Command {
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
    if (laneState.front) {
      game.log.push("Le front de cette ligne est deja occupe.");
      return;
    }
    const instance = laneState.removeFromTranchee(this.instanceId);
    if (!instance) return;

    if (instance.isMovementBlocked(game.turn)) {
      game.log.push(`${instance.card.nom} est immobilise par des barbeles.`);
      laneState.placeInTranchee(instance);
      return;
    }

    laneState.front = instance;
    game.log.push(`${game.activeFactionLabel} engage ${instance.card.nom} au front (${this.lane}).`);
    this.triggerTrapIfAny(game, instance);
  }

  triggerTrapIfAny(game, instance) {
    const trap = game.traps[this.lane];
    if (!trap || trap.owner === game.active) return;

    game.traps[this.lane] = null;
    const destroyed = instance.receiveDamage(trap.damage);
    game.log.push(`Mine enterree : ${instance.card.nom} declenche le piege sur ${this.lane} !`);
    if (destroyed) {
      game.activePlayer.lanes[this.lane].front = null;
      game.log.push(`${instance.card.nom} est detruit par la mine.`);
    } else {
      instance.movementBlockedUntilTurn = game.turn + 1;
    }
  }
}
