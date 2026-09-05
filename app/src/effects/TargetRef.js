// Une cible de sort est soit l'id d'une CardInstance, soit une reference de
// heros sous la forme "hero:<idJoueur>". Ce petit helper evite de dupliquer
// le prefixage/parsing partout ou une cible est manipulee (UI comprise).
export const Target = {
  hero(playerId) {
    return `hero:${playerId}`;
  },

  isHero(targetId) {
    return typeof targetId === "string" && targetId.startsWith("hero:");
  },

  heroOwner(targetId) {
    return targetId.slice("hero:".length);
  },
};
