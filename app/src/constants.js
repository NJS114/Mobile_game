// Constantes partagees du moteur de jeu.
export const LANES = ["nord", "centre", "sud"];
export const TRANCHEE_SLOTS = 2;

export function otherFaction(faction) {
  return faction === "chat" ? "chien" : "chat";
}

export function factionLabel(faction) {
  return faction === "chat" ? "Chat" : "Chien";
}
