import { Command } from "./Command.js";
import { CombatMath } from "../combat/CombatMath.js";
import { otherFaction } from "../constants.js";

// Combat manuel et cible : le joueur choisit laquelle de ses cartes au
// front attaque, et quelle carte adverse elle vise (ou l'ennemi directement
// si son front est vide). Remplace l'ancienne resolution automatique par
// couloir.
export class AttackCommand extends Command {
  constructor(attackerInstanceId, targetInstanceId = null) {
    super();
    this.attackerInstanceId = attackerInstanceId;
    this.targetInstanceId = targetInstanceId;
  }

  execute(game) {
    const attacker = this.findAttacker(game);
    if (!attacker) return;

    const enemyZones = game.players[otherFaction(game.active)].zones;
    if (this.targetInstanceId) this.attackCard(game, attacker, enemyZones);
    else this.attackBase(game, attacker, enemyZones);

    attacker.hasAttacked = true;
  }

  findAttacker(game) {
    const attacker = game.activePlayer.zones.front.find((c) => c.instanceId === this.attackerInstanceId);
    if (!attacker) return null;
    if (attacker.hasAttacked) {
      game.log.push(`${attacker.card.nom} a deja attaque ce tour.`);
      return null;
    }
    return attacker;
  }

  attackCard(game, attacker, enemyZones) {
    const target = enemyZones.front.find((c) => c.instanceId === this.targetInstanceId);
    if (!target) return;

    const attackerDamage = CombatMath.effectiveAttack(attacker);
    const targetDamage = CombatMath.effectiveAttack(target);
    game.log.push(`${attacker.card.nom} (ATQ ${attackerDamage}) attaque ${target.card.nom} (ATQ ${targetDamage}).`);

    if (target.receiveDamage(attackerDamage)) {
      enemyZones.removeFromFront(target.instanceId);
      game.log.push(`${target.card.nom} est elimine.`);
    }
    if (attacker.receiveDamage(targetDamage)) {
      game.activePlayer.zones.removeFromFront(attacker.instanceId);
      game.log.push(`${attacker.card.nom} est elimine en ripostant.`);
    }
    CombatMath.consumeOneShotEffects(attacker);
    CombatMath.consumeOneShotEffects(target);
  }

  attackBase(game, attacker, enemyZones) {
    if (enemyZones.front.length > 0) {
      game.log.push("Impossible de frapper la base : le front adverse n'est pas vide.");
      return;
    }
    const damage = CombatMath.effectiveAttack(attacker);
    const defenderFaction = otherFaction(game.active);
    game.players[defenderFaction].moral -= damage;
    game.log.push(`${attacker.card.nom} frappe directement : ${damage} degats au moral ${defenderFaction}.`);
    CombatMath.consumeOneShotEffects(attacker);
  }
}
