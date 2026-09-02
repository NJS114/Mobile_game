import { VictoryCondition } from "./VictoryCondition.js";
import { otherFaction } from "../constants.js";

// Une fois le Drapeau d'Objectif joue, le camp dont le front est occupe
// alors que l'adversaire n'a personne au front accumule des tours de
// controle (pas forcement consecutifs) ; il gagne au bout de 3.
export class FlagControlVictoryCondition extends VictoryCondition {
  static TURNS_NEEDED = 3;

  check(game) {
    if (!game.flagActive) return null;
    for (const faction of ["chat", "chien"]) {
      if (this.updateStreakAndCheck(game, faction)) return faction;
    }
    return null;
  }

  updateStreakAndCheck(game, faction) {
    const enemyFaction = otherFaction(faction);
    const controlsField = game.players[faction].zones.front.length > 0 && game.players[enemyFaction].zones.front.length === 0;
    if (controlsField) game.flagControlStreak[faction] += 1;
    return game.flagControlStreak[faction] >= FlagControlVictoryCondition.TURNS_NEEDED;
  }
}
