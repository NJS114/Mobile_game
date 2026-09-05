import { HeroVictoryCondition } from "./HeroVictoryCondition.js";

// Composite Pattern : interroge chaque condition dans l'ordre jusqu'a en
// trouver une qui declare un vainqueur. Une seule condition pour l'instant
// (heros a 0 PV), mais la structure reste ouverte a d'autres regles futures
// (ex. fatigue) sans toucher au moteur.
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
    return new VictoryChecker([new HeroVictoryCondition()]);
  }
}
