import { Command } from "./Command.js";

// Fait surgir la carte cachee dans le tunnel directement au front, en
// embuscade (double degats a la prochaine attaque, voir CombatMath).
export class EmergeTunnelCommand extends Command {
  execute(game) {
    const zones = game.activePlayer.zones;
    if (!zones.tunnel) return;
    if (!zones.hasFreeFrontSlot()) {
      game.log.push("Le front est complet, l'embuscade est impossible.");
      return;
    }
    const instance = zones.tunnel;
    zones.tunnel = null;
    zones.tunnelTurnsHidden = 0;
    instance.ambush = true;
    zones.addToFront(instance);
    game.log.push(`${instance.card.nom} surgit du tunnel en embuscade !`);
  }
}
