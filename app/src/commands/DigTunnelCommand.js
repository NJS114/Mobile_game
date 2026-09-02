import { Command } from "./Command.js";

// Seul un sapeur peut creuser le tunnel (un seul a la fois par joueur).
export class DigTunnelCommand extends Command {
  constructor(instanceId) {
    super();
    this.instanceId = instanceId;
  }

  execute(game) {
    const zones = game.activePlayer.zones;
    if (zones.tunnel) {
      game.log.push("Un tunnel est deja en cours d'utilisation.");
      return;
    }
    const instance = zones.removeFromTranchee(this.instanceId);
    if (!instance) return;

    if (!instance.card.isSapeur?.()) {
      game.log.push("Seul un sapeur peut creuser un tunnel.");
      zones.placeInTranchee(instance);
      return;
    }
    zones.tunnel = instance;
    zones.tunnelTurnsHidden = 0;
    game.log.push(`${instance.card.nom} creuse un tunnel.`);
  }
}
