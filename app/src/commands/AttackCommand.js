import { Command } from "./Command.js";
import { otherPlayer } from "../constants.js";
import { Target } from "../effects/TargetRef.js";

// Attaque une unite adverse ciblee, ou frappe directement le heros adverse
// si la cible est une reference de heros. Respecte la Garde (Taunt) :
// tant qu'une unite Garde est en vie en face, elle seule peut etre ciblee.
export class AttackCommand extends Command {
  constructor(attackerInstanceId, targetId) {
    super();
    this.attackerInstanceId = attackerInstanceId;
    this.targetId = targetId;
  }

  execute(game) {
    const attackerId = game.active;
    const defenderId = otherPlayer(attackerId);
    const attacker = game.players[attackerId].board.find((u) => u.instanceId === this.attackerInstanceId);
    if (!attacker || !attacker.canAttack()) return;

    const defender = game.players[defenderId];
    if (!this.isTargetAllowed(defender)) {
      game.log.push("Une unite Garde doit etre ciblee en priorite.");
      return;
    }

    attacker.hasAttacked = true;

    if (Target.isHero(this.targetId)) {
      this.strikeHero(game, attacker, defender);
    } else {
      this.strikeUnit(game, attacker, defender);
    }
  }

  isTargetAllowed(defender) {
    const tauntUnits = defender.board.filter((u) => u.isTaunt);
    if (tauntUnits.length === 0) return true;
    return !Target.isHero(this.targetId) && tauntUnits.some((u) => u.instanceId === this.targetId);
  }

  strikeHero(game, attacker, defender) {
    defender.takeDamage(attacker.atq);
    game.log.push(`${attacker.card.nom} inflige ${attacker.atq} degats directs.`);
  }

  strikeUnit(game, attacker, defender) {
    const defenderUnit = defender.board.find((u) => u.instanceId === this.targetId);
    if (!defenderUnit) return;

    const attackerDied = attacker.receiveDamage(defenderUnit.atq);
    const defenderDied = defenderUnit.receiveDamage(attacker.atq);
    game.log.push(`${attacker.card.nom} affronte ${defenderUnit.card.nom}.`);

    if (attackerDied) game.destroyUnit(attacker);
    if (defenderDied) game.destroyUnit(defenderUnit);
  }
}
