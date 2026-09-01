// Command Pattern : chaque action du joueur (deployer, deplacer, jouer un
// objet, finir le tour...) est un objet avec une seule methode execute().
// Cela garde Game.execute() minuscule et rend chaque action testable seule.
export class Command {
  execute(_game) {
    throw new Error("execute() doit etre implemente par la sous-classe");
  }
}
