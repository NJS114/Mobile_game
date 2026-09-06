import { Command } from "./Command.js";
import { AutoAttackResolver } from "../combat/AutoAttackResolver.js";

export class EndTurnCommand extends Command {
  execute(game) {
    AutoAttackResolver.resolve(game);
    game.switchActivePlayer();
  }
}
