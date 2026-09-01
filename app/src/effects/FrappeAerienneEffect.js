import { EffectStrategy } from "./EffectStrategy.js";

// Touche le front adverse et revele une carte cachee en tranchee sur la
// meme ligne. Bloquee si un Fumigene est actif sur ce couloir.
export class FrappeAerienneEffect extends EffectStrategy {
  static DAMAGE = 4;

  apply(ctx) {
    if (this.isBlockedBySmoke(ctx)) {
      ctx.log(`Frappe Aerienne bloquee par le fumigene sur ${ctx.lane}.`);
      return;
    }
    this.strikeFront(ctx);
    this.revealHiddenTranchee(ctx);
  }

  isBlockedBySmoke(ctx) {
    return ctx.game.smokeUntil[ctx.lane] >= ctx.game.turn;
  }

  strikeFront(ctx) {
    const enemy = ctx.enemyLane;
    if (!enemy.front) return;
    const destroyed = enemy.front.receiveDamage(FrappeAerienneEffect.DAMAGE);
    ctx.log(destroyed ? `Frappe Aerienne detruit ${enemy.front.card.nom}.` : `Frappe Aerienne blesse ${enemy.front.card.nom}.`);
    if (destroyed) enemy.front = null;
  }

  revealHiddenTranchee(ctx) {
    const hidden = ctx.enemyLane.tranchee.find((c) => c && !c.revealed);
    if (!hidden) return;
    hidden.revealed = true;
    ctx.log(`Frappe Aerienne revele ${hidden.card.nom} en tranchee.`);
  }
}
