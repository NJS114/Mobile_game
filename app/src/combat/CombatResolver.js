import { LANES, otherFaction } from "../constants.js";

// Responsabilite unique : resoudre les combats de front a la fin d'un
// tour. Ne connait rien du DOM ni des commandes, uniquement l'etat du jeu.
export class CombatResolver {
  resolve(game) {
    for (const lane of LANES) {
      this.resolveLane(game, lane);
    }
  }

  resolveLane(game, lane) {
    const chatCard = game.players.chat.lanes[lane].front;
    const chienCard = game.players.chien.lanes[lane].front;

    if (chatCard && chienCard) this.resolveMutualCombat(game, lane, chatCard, chienCard);
    else if (chatCard) this.resolveBreakthrough(game, lane, "chat", chatCard);
    else if (chienCard) this.resolveBreakthrough(game, lane, "chien", chienCard);
  }

  resolveMutualCombat(game, lane, chatCard, chienCard) {
    const chatAtk = this.effectiveAttack(chatCard);
    const chienAtk = this.effectiveAttack(chienCard);
    game.log.push(`Combat ${lane} : ${chatCard.card.nom} (ATQ ${chatAtk}) vs ${chienCard.card.nom} (ATQ ${chienAtk}).`);

    if (chatCard.receiveDamage(chienAtk)) this.eliminate(game, "chat", lane);
    if (chienCard.receiveDamage(chatAtk)) this.eliminate(game, "chien", lane);

    this.consumeOneShotEffects(chatCard);
    this.consumeOneShotEffects(chienCard);
  }

  resolveBreakthrough(game, lane, attackerFaction, attackerCard) {
    const damage = this.effectiveAttack(attackerCard);
    const defenderFaction = otherFaction(attackerFaction);
    game.players[defenderFaction].moral -= damage;
    game.log.push(`${attackerCard.card.nom} perce sur ${lane} : ${damage} degats au moral ${defenderFaction}.`);
    this.consumeOneShotEffects(attackerCard);
  }

  effectiveAttack(instance) {
    const base = instance.skipNextAttack ? 0 : instance.attaque;
    return instance.ambush ? base * 2 : base;
  }

  consumeOneShotEffects(instance) {
    instance.skipNextAttack = false;
    instance.ambush = false;
  }

  eliminate(game, faction, lane) {
    const laneState = game.players[faction].lanes[lane];
    game.log.push(`${laneState.front.card.nom} est elimine.`);
    laneState.front = null;
  }
}
