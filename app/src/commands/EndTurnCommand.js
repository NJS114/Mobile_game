import { Command } from "./Command.js";

export class EndTurnCommand extends Command {
  execute(game) {
    game.advanceTunnelHiding();
    game.combatResolver.resolve(game);

    game.winner = game.victoryChecker.determineWinner(game);
    if (game.winner) {
      game.log.push(`Victoire des ${game.factionLabel(game.winner)}s !`);
      game.events.emit("victory", game.winner);
      return;
    }
    game.switchActivePlayer();
    game.events.emit("turnEnded", game.active);
  }
}
