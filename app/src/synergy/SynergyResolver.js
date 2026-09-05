import { TribeSynergy } from "./TribeSynergy.js";

// Recalcule integralement les bonus de synergie de tribu a chaque
// changement de composition du plateau (carte jouee, unite detruite...).
// Toujours reset puis reappliquer : jamais d'increment, pour rester
// idempotent quel que soit le nombre d'appels.
export class SynergyResolver {
  constructor(synergies) {
    this.synergies = synergies;
  }

  recompute(game) {
    for (const player of Object.values(game.players)) {
      for (const unit of player.board) unit.resetSynergyBonus();
      for (const synergy of this.synergies) synergy.apply(player.board);
    }
  }

  static buildDefault() {
    return new SynergyResolver([
      new TribeSynergy("nobles", 2, 1),
      new TribeSynergy("robots", 2, 2),
      new TribeSynergy("sante", 3, 2),
    ]);
  }
}
