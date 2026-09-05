// Constantes partagees du moteur de jeu.
// Modele "Paw & Claw" : plateau simple façon Hearthstone (mana, plateau,
// points de vie de heros), deux camps (Chats / Chiens) qui piochent chacun
// dans leur propre moitie de la collection, et des synergies de tribu façon
// TFT qui recoupent les deux camps (voir docs/GAME_DESIGN.md).
export const HERO_HP_INITIAL = 30;
export const MANA_INITIAL = 1;
export const MANA_MAX = 10;
export const BOARD_CAPACITY = 7;
export const HAND_CAPACITY = 10;
export const STARTING_HAND_SIZE = 3;

export const TRIBES = ["robots", "nobles", "sante"];
export const FACTIONS = ["chat", "chien"];

export function otherFaction(faction) {
  return faction === "chat" ? "chien" : "chat";
}

export function factionLabel(faction) {
  return faction === "chat" ? "Chats" : "Chiens";
}
