import { AttackCommand } from "../commands/AttackCommand.js";
import { otherFaction } from "../constants.js";
import { Target } from "../effects/TargetRef.js";

// Resout automatiquement, en fin de tour, l'attaque de toute unite du
// joueur actif qui n'a pas encore attaque ce tour-ci (canAttack() true) :
// une attaque manuelle pendant le tour permet de choisir precisement sa
// cible, mais aucune attaque possible n'est jamais perdue si le joueur ne
// l'a pas fait lui-meme. La cible choisie suit exactement les memes regles
// que l'attaque manuelle (voir AttackCommand) : une Garde adverse en priorite,
// sinon une unite adverse quelconque, sinon le heros adverse directement.
export class AutoAttackResolver {
  static resolve(game) {
    const attackerFaction = game.active;
    const defenderFaction = otherFaction(attackerFaction);
    const attacker = game.players[attackerFaction];
    const defender = game.players[defenderFaction];

    for (const unit of [...attacker.board]) {
      if (defender.isDefeated()) break;
      if (!unit.canAttack()) continue;
      const targetId = this.chooseTarget(defender, defenderFaction);
      new AttackCommand(unit.instanceId, targetId).execute(game);
    }
  }

  static chooseTarget(defender, defenderFaction) {
    const taunt = defender.board.find((u) => u.isTaunt);
    if (taunt) return taunt.instanceId;
    if (defender.board.length > 0) return defender.board[0].instanceId;
    return Target.hero(defenderFaction);
  }
}
