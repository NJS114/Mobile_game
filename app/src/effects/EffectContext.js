import { otherFaction } from "../constants.js";

// Contexte passe a chaque EffectStrategy : evite que chaque effet doive
// re-ecrire la meme navigation dans l'etat du jeu.
export class EffectContext {
  constructor({ game, faction, cardDef }) {
    this.game = game;
    this.faction = faction;
    this.cardDef = cardDef;
  }

  get enemyFaction() {
    return otherFaction(this.faction);
  }

  get ownZones() {
    return this.game.players[this.faction].zones;
  }

  get enemyZones() {
    return this.game.players[this.enemyFaction].zones;
  }

  log(message) {
    this.game.log.push(message);
  }
}
