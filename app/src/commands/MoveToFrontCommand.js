import { Command } from "./Command.js";

export class MoveToFrontCommand extends Command {
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
    if (!zones.hasFreeFrontSlot()) {
      game.log.push("Le front est complet.");
      return;
    }
    const instance = zones.removeFromTranchee(this.instanceId);
    if (!instance) return;

    if (instance.isMovementBlocked(game.turn)) {
      game.log.push(`${instance.card.nom} est immobilise par des barbeles.`);
      zones.placeInTranchee(instance);
      return;
    }

    zones.addToFront(instance);
    game.log.push(`${game.activeFactionLabel} engage ${instance.card.nom} au front.`);
    this.triggerTrapIfAny(game, instance);
  }

  triggerTrapIfAny(game, instance) {
    const trap = game.trap;
    if (!trap || trap.owner === game.active) return;

    game.trap = null;
    const destroyed = instance.receiveDamage(trap.damage);
    game.log.push(`Mine enterree : ${instance.card.nom} declenche le piege !`);
    if (destroyed) {
      game.activePlayer.zones.removeFromFront(instance.instanceId);
      game.log.push(`${instance.card.nom} est detruit par la mine.`);
    } else {
      instance.movementBlockedUntilTurn = game.turn + 1;
    }
  }
}
