import { otherPlayer } from "../constants.js";
import { Target } from "./TargetRef.js";

// Contexte passe a chaque EffectStrategy : evite que chaque sort doive
// re-ecrire la meme navigation dans l'etat du jeu (trouver une cible,
// distinguer allie/ennemi, infliger des degats a une unite ou un heros...).
export class EffectContext {
  constructor({ game, casterId }) {
    this.game = game;
    this.casterId = casterId;
  }

  get opponentId() {
    return otherPlayer(this.casterId);
  }

  get caster() {
    return this.game.players[this.casterId];
  }

  get opponent() {
    return this.game.players[this.opponentId];
  }

  log(message) {
    this.game.log.push(message);
  }

  findInstance(instanceId) {
    return this.caster.findInstanceAnywhere(instanceId) ?? this.opponent.findInstanceAnywhere(instanceId);
  }

  ownerIdOf(instanceId) {
    if (this.caster.board.some((u) => u.instanceId === instanceId)) return this.casterId;
    if (this.opponent.board.some((u) => u.instanceId === instanceId)) return this.opponentId;
    return null;
  }

  isAlly(targetId) {
    if (Target.isHero(targetId)) return Target.heroOwner(targetId) === this.casterId;
    return this.ownerIdOf(targetId) === this.casterId;
  }

  isEnemy(targetId) {
    return !this.isAlly(targetId);
  }

  dealDamage(targetId, amount) {
    if (Target.isHero(targetId)) {
      this.game.players[Target.heroOwner(targetId)].takeDamage(amount);
      return;
    }
    const instance = this.findInstance(targetId);
    if (!instance) return;
    if (instance.receiveDamage(amount)) this.game.destroyUnit(instance);
  }

  heal(targetId, amount) {
    if (Target.isHero(targetId)) {
      this.game.players[Target.heroOwner(targetId)].heal(amount);
      return;
    }
    this.findInstance(targetId)?.heal(amount);
  }

  destroyInstance(targetId) {
    const instance = this.findInstance(targetId);
    if (instance) this.game.destroyUnit(instance);
  }

  drawCards(playerId, amount) {
    this.game.players[playerId].drawMany(amount);
  }
}
