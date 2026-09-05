import { TribeSynergy } from "./TribeSynergy.js";

// Recalcule integralement les bonus de synergie de tribu a chaque
// changement de composition du plateau (carte jouee, unite detruite...).
// Toujours reset puis reappliquer : jamais d'increment, pour rester
// idempotent quel que soit le nombre d'appels. Le reset se fait pour les
// DEUX camps avant d'appliquer la moindre synergie, car une synergie peut
// affecter le plateau adverse (malus) et non pas seulement le sien (bonus).
export class SynergyResolver {
  constructor(synergies) {
    this.synergies = synergies;
  }

  recompute(game) {
    const [playerA, playerB] = Object.values(game.players);
    for (const unit of playerA.board) unit.resetSynergyBonus();
    for (const unit of playerB.board) unit.resetSynergyBonus();

    for (const synergy of this.synergies) {
      synergy.apply(playerA.board, playerB.board);
      synergy.apply(playerB.board, playerA.board);
    }
  }

  static buildDefault() {
    return new SynergyResolver([
      new TribeSynergy("nobles", 2, 1),
      // Les Robots gagnent moins de puissance propre, mais perturbent
      // l'ennemi : un buff et un debuff dans la meme synergie.
      new TribeSynergy("robots", 2, 1, -1),
      new TribeSynergy("sante", 3, 2),
    ]);
  }
}
