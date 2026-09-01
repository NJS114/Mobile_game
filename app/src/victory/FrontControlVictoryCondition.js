import { VictoryCondition } from "./VictoryCondition.js";
import { LANES, otherFaction } from "../constants.js";

// Controler 2 fronts sur 3 pendant 2 tours consecutifs (voir GAME_DESIGN.md
// section 9). "Controler" = avoir une carte au front que l'adversaire n'a
// pas encore contree sur cette ligne.
export class FrontControlVictoryCondition extends VictoryCondition {
  static LANES_NEEDED = 2;
  static STREAK_NEEDED = 2;

  check(game) {
    for (const faction of ["chat", "chien"]) {
      const controlledLanes = this.countControlledLanes(game, faction);
      game.controlStreak[faction] = controlledLanes >= FrontControlVictoryCondition.LANES_NEEDED ? game.controlStreak[faction] + 1 : 0;
      if (game.controlStreak[faction] >= FrontControlVictoryCondition.STREAK_NEEDED) return faction;
    }
    return null;
  }

  countControlledLanes(game, faction) {
    const enemyFaction = otherFaction(faction);
    return LANES.filter((lane) => {
      const own = game.players[faction].lanes[lane];
      const enemy = game.players[enemyFaction].lanes[lane];
      return own.front && !enemy.front;
    }).length;
  }
}
