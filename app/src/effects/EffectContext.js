import { otherFaction } from "../constants.js";

// Contexte passe a chaque EffectStrategy : evite que chaque effet doive
// re-ecrire la meme navigation dans l'etat du jeu.
export class EffectContext {
  constructor({ game, faction, lane, cardDef }) {
    this.game = game;
    this.faction = faction;
    this.lane = lane;
    this.cardDef = cardDef;
  }

  get enemyFaction() {
    return otherFaction(this.faction);
  }

  get ownLane() {
    return this.game.players[this.faction].lanes[this.lane];
  }

  get enemyLane() {
    return this.game.players[this.enemyFaction].lanes[this.lane];
  }

  log(message) {
    this.game.log.push(message);
  }
}
