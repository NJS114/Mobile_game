import { Command } from "./Command.js";
import { SpellCard } from "../core/Card.js";
import { EffectContext } from "../effects/EffectContext.js";

// Joue un sort de la main, avec ciblage optionnel selon la strategie
// enregistree pour son effetId (voir EffectRegistry).
export class PlaySpellCommand extends Command {
  constructor(instanceId, targetId = null) {
    super();
    this.instanceId = instanceId;
    this.targetId = targetId;
  }

  execute(game) {
    const player = game.activePlayer;
    const instance = player.hand.find((c) => c.instanceId === this.instanceId);
    if (!instance || !(instance.card instanceof SpellCard)) return;
    if (!player.canAfford(instance.card)) return;

    const strategy = game.effects.get(instance.card.effetId);
    if (!strategy) return;
    if (strategy.requiresTarget() && !this.targetId) return;

    const context = new EffectContext({ game, casterId: game.active });
    if (strategy.requiresTarget() && !strategy.isValidTarget(context, this.targetId)) {
      game.log.push("Cible invalide pour ce sort.");
      return;
    }

    player.removeFromHand(this.instanceId);
    player.spendMana(instance.card.cout);
    strategy.apply(context, this.targetId);
    game.log.push(`${game.activeLabel} joue ${instance.card.nom}.`);
    game.recomputeSynergies();
  }
}
