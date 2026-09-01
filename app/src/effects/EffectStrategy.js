// Strategy Pattern : chaque objet de destabilisation implemente cette
// interface. Ajouter une nouvelle carte objet = ajouter une classe, sans
// toucher au moteur (principe ouvert/ferme).
export class EffectStrategy {
  // Certains effets ont besoin qu'on designe une carte cible avant de
  // s'appliquer (Os d'Attraction, Pelote de Laine, Barbeles...).
  requiresTarget() {
    return false;
  }

  /**
   * @param {EffectContext} context
   * @param {string|null} targetInstanceId
   */
  apply(_context, _targetInstanceId = null) {
    throw new Error("apply() doit etre implemente par la sous-classe");
  }
}
