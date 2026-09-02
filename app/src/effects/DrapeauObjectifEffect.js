import { EffectStrategy } from "./EffectStrategy.js";

// Active le suivi de controle du champ de bataille : des lors, le camp
// dont le front est occupe alors que l'adversaire n'a personne au front,
// plusieurs tours cumules, remporte la partie (voir FlagControlVictoryCondition).
export class DrapeauObjectifEffect extends EffectStrategy {
  apply(ctx) {
    ctx.game.flagActive = true;
    ctx.log("Drapeau d'Objectif plante sur le champ de bataille.");
  }
}
