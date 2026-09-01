import { VictoryCondition } from "./VictoryCondition.js";
import { otherFaction } from "../constants.js";

// Capturer le drapeau d'objectif pendant plusieurs tours cumules (pas
// forcement consecutifs) sur le couloir ou il a ete pose.
export class FlagControlVictoryCondition extends VictoryCondition {
  static TURNS_NEEDED = 3;

  check(game) {
    if (!game.flagLane) return null;
    for (const faction of ["chat", "chien"]) {
      if (this.updateStreakAndCheck(game, faction)) return faction;
    }
    return null;
  }

  updateStreakAndCheck(game, faction) {
    const enemyFaction = otherFaction(faction);
    const own = game.players[faction].lanes[game.flagLane];
    const enemy = game.players[enemyFaction].lanes[game.flagLane];
    const controlsFlag = Boolean(own.front) && !enemy.front;
    own.flagControlStreak = controlsFlag ? own.flagControlStreak + 1 : own.flagControlStreak;
    return own.flagControlStreak >= FlagControlVictoryCondition.TURNS_NEEDED;
  }
}
