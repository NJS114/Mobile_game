// Constantes partagees du moteur de jeu.
// Modele "Paw & Claw" : plateau simple façon Hearthstone (mana, plateau,
// points de vie de heros) avec des synergies de tribu façon TFT
// (voir docs/GAME_DESIGN.md).
export const HERO_HP_INITIAL = 30;
export const MANA_INITIAL = 1;
export const MANA_MAX = 10;
export const BOARD_CAPACITY = 7;
export const HAND_CAPACITY = 10;
export const STARTING_HAND_SIZE = 3;

export const TRIBES = ["robots", "nobles", "sante"];

export function otherPlayer(playerId) {
  return playerId === "joueur1" ? "joueur2" : "joueur1";
}

export function playerLabel(playerId) {
  return playerId === "joueur1" ? "Joueur 1" : "Joueur 2";
}
