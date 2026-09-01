import { Command } from "./Command.js";

// Seul un sapeur peut creuser le tunnel de sa ligne (1 par ligne, voir
// GAME_DESIGN.md section 6).
export class DigTunnelCommand extends Command {
  constructor(instanceId, lane) {
    super();
    this.instanceId = instanceId;
    this.lane = lane;
  }

  execute(game) {
    const laneState = game.activePlayer.lanes[this.lane];
    if (laneState.tunnel) {
      game.log.push("Un tunnel existe deja sur cette ligne.");
      return;
    }
    const instance = laneState.removeFromTranchee(this.instanceId);
    if (!instance) return;

    if (!instance.card.isSapeur?.()) {
      game.log.push("Seul un sapeur peut creuser un tunnel.");
      laneState.placeInTranchee(instance);
      return;
    }
    laneState.tunnel = instance;
    laneState.tunnelTurnsHidden = 0;
    game.log.push(`${instance.card.nom} creuse un tunnel sur ${this.lane}.`);
  }
}
