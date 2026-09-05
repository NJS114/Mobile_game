import { VictoryCondition } from "./VictoryCondition.js";

export class HeroVictoryCondition extends VictoryCondition {
  check(game) {
    if (game.players.joueur2.isDefeated()) return "joueur1";
    if (game.players.joueur1.isDefeated()) return "joueur2";
    return null;
  }
}
