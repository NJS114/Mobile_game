import { VictoryCondition } from "./VictoryCondition.js";

export class HeroVictoryCondition extends VictoryCondition {
  check(game) {
    if (game.players.chien.isDefeated()) return "chat";
    if (game.players.chat.isDefeated()) return "chien";
    return null;
  }
}
