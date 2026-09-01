import { MoralVictoryCondition } from "./MoralVictoryCondition.js";
import { FrontControlVictoryCondition } from "./FrontControlVictoryCondition.js";
import { FlagControlVictoryCondition } from "./FlagControlVictoryCondition.js";

// Composite Pattern : interroge chaque condition dans l'ordre jusqu'a en
// trouver une qui declare un vainqueur.
export class VictoryChecker {
  constructor(conditions) {
    this.conditions = conditions;
  }

  determineWinner(game) {
    for (const condition of this.conditions) {
      const winner = condition.check(game);
      if (winner) return winner;
    }
    return null;
  }

  static buildDefault() {
    return new VictoryChecker([new MoralVictoryCondition(), new FrontControlVictoryCondition(), new FlagControlVictoryCondition()]);
  }
}
