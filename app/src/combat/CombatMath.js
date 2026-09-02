// Petits calculs de combat partages entre AttackCommand et les effets qui
// modifient les degats (embuscade, action perdue...). Aucune dependance a
// l'etat du jeu : uniquement des fonctions pures sur une CardInstance.
export class CombatMath {
  static effectiveAttack(instance) {
    const base = instance.skipNextAttack ? 0 : instance.attaque;
    return instance.ambush ? base * 2 : base;
  }

  static consumeOneShotEffects(instance) {
    instance.skipNextAttack = false;
    instance.ambush = false;
  }
}
