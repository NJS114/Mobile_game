import { EffectStrategy } from "./EffectStrategy.js";

// Touche une carte ciblee au front adverse et revele une carte cachee en
// tranchee. Bloquee si un Fumigene est actif.
export class FrappeAerienneEffect extends EffectStrategy {
  static DAMAGE = 4;

  requiresTarget() {
    return true;
  }

  apply(ctx, targetInstanceId) {
    if (this.isBlockedBySmoke(ctx)) {
      ctx.log("Frappe Aerienne bloquee par le fumigene.");
      return;
    }
    this.strikeTarget(ctx, targetInstanceId);
    this.revealHiddenTranchee(ctx);
  }

  isBlockedBySmoke(ctx) {
    return ctx.game.smokeUntil >= ctx.game.turn;
  }

  strikeTarget(ctx, targetInstanceId) {
    const enemy = ctx.enemyZones;
    const target = enemy.front.find((c) => c.instanceId === targetInstanceId);
    if (!target) {
      ctx.log("Frappe Aerienne : cible introuvable au front adverse.");
      return;
    }
    const destroyed = target.receiveDamage(FrappeAerienneEffect.DAMAGE);
    ctx.log(destroyed ? `Frappe Aerienne detruit ${target.card.nom}.` : `Frappe Aerienne blesse ${target.card.nom}.`);
    if (destroyed) enemy.removeFromFront(target.instanceId);
  }

  revealHiddenTranchee(ctx) {
    const hidden = ctx.enemyZones.tranchee.find((c) => c && !c.revealed);
    if (!hidden) return;
    hidden.revealed = true;
    ctx.log(`Frappe Aerienne revele ${hidden.card.nom} en tranchee.`);
  }
}
