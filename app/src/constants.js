// Constantes partagees du moteur de jeu.
// Plateau simplifie : plus de couloirs Nord/Centre/Sud - chaque camp a une
// seule reserve, une seule tranchee et un seul front partage ou les cartes
// sont posees librement (voir docs/GAME_DESIGN.md).
export const TRANCHEE_SLOTS = 4;
export const FRONT_CAPACITY = 5;

export function otherFaction(faction) {
  return faction === "chat" ? "chien" : "chat";
}

export function factionLabel(faction) {
  return faction === "chat" ? "Chat" : "Chien";
}
