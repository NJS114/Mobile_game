// Strategy Pattern : chaque condition de victoire sait juger l'etat du jeu
// et rendre "chat", "chien" ou null. Le moteur ne connait pas leur nombre
// ni leur detail (voir VictoryChecker).
export class VictoryCondition {
  check(_game) {
    throw new Error("check() doit etre implemente par la sous-classe");
  }
}
