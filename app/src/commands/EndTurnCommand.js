import { Command } from "./Command.js";

export class EndTurnCommand extends Command {
  execute(game) {
    game.switchActivePlayer();
  }
}
