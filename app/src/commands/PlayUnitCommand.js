import { Command } from "./Command.js";
import { UnitCard } from "../core/Card.js";

// Pose une unite de la main sur le plateau (paiement du mana, plateau plein
// = echec silencieux, comme dans Hearthstone une action illegale ne se
// produit simplement pas).
export class PlayUnitCommand extends Command {
  constructor(instanceId) {
    super();
    this.instanceId = instanceId;
  }

  execute(game) {
    const player = game.activePlayer;
    const instance = player.hand.find((c) => c.instanceId === this.instanceId);
    if (!instance || !(instance.card instanceof UnitCard)) return;
    if (!player.canAfford(instance.card)) return;
    if (!player.hasFreeBoardSlot()) {
      game.log.push("Le plateau est plein.");
      return;
    }

    player.removeFromHand(this.instanceId);
    player.spendMana(instance.card.cout);
    instance.summoningSick = !instance.isCharge;
    player.addToBoard(instance);
    game.log.push(`${game.activeLabel} joue ${instance.card.nom}.`);
    game.recomputeSynergies();
  }
}
