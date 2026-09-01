import { Command } from "./Command.js";

// Fait surgir la carte cachee dans le tunnel directement au front, en
// embuscade (double degats au prochain combat, voir CombatResolver).
export class EmergeTunnelCommand extends Command {
  constructor(lane) {
    super();
    this.lane = lane;
  }

  execute(game) {
    const laneState = game.activePlayer.lanes[this.lane];
    if (!laneState.tunnel) return;
    if (laneState.front) {
      game.log.push("Le front est deja occupe, l'embuscade est impossible.");
      return;
    }
    const instance = laneState.tunnel;
    laneState.tunnel = null;
    laneState.tunnelTurnsHidden = 0;
    instance.ambush = true;
    laneState.front = instance;
    game.log.push(`${instance.card.nom} surgit du tunnel en embuscade sur ${this.lane} !`);
  }
}
