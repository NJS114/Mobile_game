// Strategy Pattern : chaque sort implemente cette interface. Ajouter un
// nouveau sort = ajouter une classe + une ligne dans EffectRegistry, sans
// jamais toucher au moteur (principe ouvert/ferme).
export class EffectStrategy {
  // Certains sorts ont besoin qu'on designe une cible (unite ou heros)
  // avant de s'appliquer (soin, degats, buff...).
  requiresTarget() {
    return false;
  }

  // Validation fine de la cible (allie/ennemi, unite/heros, cout max...).
  // Par defaut toute cible est acceptee ; a surcharger si besoin.
  isValidTarget(_context, _targetId) {
    return true;
  }

  /**
   * @param {import("./EffectContext.js").EffectContext} context
   * @param {string|null} targetId
   */
  apply(_context, _targetId = null) {
    throw new Error("apply() doit etre implemente par la sous-classe");
  }
}
