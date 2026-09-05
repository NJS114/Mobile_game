import { PlayUnitCommand } from "../src/commands/PlayUnitCommand.js";
import { PlaySpellCommand } from "../src/commands/PlaySpellCommand.js";
import { AttackCommand } from "../src/commands/AttackCommand.js";
import { EndTurnCommand } from "../src/commands/EndTurnCommand.js";
import { SpellCard } from "../src/core/Card.js";
import { EffectContext } from "../src/effects/EffectContext.js";
import { Target } from "../src/effects/TargetRef.js";
import { otherPlayer } from "../src/constants.js";

// Possede l'etat d'interaction transitoire (attaque en cours, cible de sort
// en attente) et traduit les clics en Command executees sur le Game. Une
// unite se joue en un seul clic ; attaquer ou cibler un sort demande de
// choisir la cible dans un second temps (les cibles valides sont surlignees
// par le Renderer via isTargetable/isHeroTargetable).
export class InputController {
  constructor(game, renderer, actionBarEl, overlays) {
    this.game = game;
    this.renderer = renderer;
    this.actionBar = actionBarEl;
    this.overlays = overlays;
    this.selection = null;
  }

  isSelected(instanceId) {
    return this.selection?.instanceId === instanceId || this.selection?.attackerInstanceId === instanceId;
  }

  isTargetable(ownerId, instanceId) {
    if (this.selection?.kind === "attacking") return this.isAttackTargetable(ownerId, instanceId);
    if (this.selection?.kind === "awaitingSpellTarget") return this.isSpellTargetValid(instanceId);
    return false;
  }

  isHeroTargetable(playerId) {
    const heroTargetId = Target.hero(playerId);
    if (this.selection?.kind === "attacking") return this.isAttackTargetable(playerId, heroTargetId);
    if (this.selection?.kind === "awaitingSpellTarget") return this.isSpellTargetValid(heroTargetId);
    return false;
  }

  // Une Garde adverse en vie doit toujours etre ciblee en priorite (voir
  // AttackCommand) : on ne surligne donc que les cibles legales.
  isAttackTargetable(defenderOwnerId, targetId) {
    if (defenderOwnerId === this.game.active) return false;
    const defender = this.game.players[otherPlayer(this.game.active)];
    const tauntUnits = defender.board.filter((u) => u.isTaunt);
    if (tauntUnits.length === 0) return true;
    if (Target.isHero(targetId)) return false;
    return tauntUnits.some((u) => u.instanceId === targetId);
  }

  isSpellTargetValid(targetId) {
    const strategy = this.currentSpellStrategy();
    if (!strategy) return false;
    const context = new EffectContext({ game: this.game, casterId: this.game.active });
    return strategy.isValidTarget(context, targetId);
  }

  currentSpellStrategy() {
    if (this.selection?.kind !== "awaitingSpellTarget") return null;
    const instance = this.game.activePlayer.hand.find((c) => c.instanceId === this.selection.instanceId);
    return instance ? this.game.effects.get(instance.card.effetId) : null;
  }

  renderAll() {
    this.renderer.render(
      this.game,
      {
        isSelected: (id) => this.isSelected(id),
        isTargetable: (ownerId, id) => this.isTargetable(ownerId, id),
        isHeroTargetable: (playerId) => this.isHeroTargetable(playerId),
      },
      {
        onHandCardClick: (id, affordable) => this.onHandCardClick(id, affordable),
        onBoardCardClick: (ownerId, id) => this.onBoardCardClick(ownerId, id),
        onHeroClick: (playerId) => this.onHeroClick(playerId),
      }
    );
    this.renderActionBar();
    if (this.game.winner) this.overlays.showVictory(this.game.winner);
  }

  onHandCardClick(instanceId, affordable) {
    if (!affordable || this.selection) return;
    const instance = this.game.activePlayer.hand.find((c) => c.instanceId === instanceId);
    if (!instance) return;
    if (instance.card instanceof SpellCard) this.playSpellOrAwaitTarget(instanceId, instance.card);
    else this.executeAndRender(new PlayUnitCommand(instanceId));
  }

  playSpellOrAwaitTarget(instanceId, card) {
    const strategy = this.game.effects.get(card.effetId);
    if (strategy?.requiresTarget()) {
      this.selection = { kind: "awaitingSpellTarget", instanceId };
      this.renderAll();
      return;
    }
    this.executeAndRender(new PlaySpellCommand(instanceId));
  }

  onBoardCardClick(ownerId, instanceId) {
    if (this.selection?.kind === "awaitingSpellTarget") {
      this.tryPlaySpellOnTarget(instanceId);
      return;
    }
    if (this.selection?.kind === "attacking") {
      this.tryAttack(ownerId, instanceId);
      return;
    }
    this.trySelectAttacker(ownerId, instanceId);
  }

  onHeroClick(playerId) {
    const targetId = Target.hero(playerId);
    if (this.selection?.kind === "awaitingSpellTarget") {
      this.tryPlaySpellOnTarget(targetId);
      return;
    }
    if (this.selection?.kind === "attacking") {
      this.tryAttack(playerId, targetId);
    }
  }

  tryPlaySpellOnTarget(targetId) {
    if (!this.isSpellTargetValid(targetId)) return;
    this.executeAndRender(new PlaySpellCommand(this.selection.instanceId, targetId));
  }

  tryAttack(defenderOwnerId, targetId) {
    if (!this.isAttackTargetable(defenderOwnerId, targetId)) return;
    this.executeAndRender(new AttackCommand(this.selection.attackerInstanceId, targetId));
  }

  trySelectAttacker(ownerId, instanceId) {
    if (ownerId !== this.game.active) return;
    const attacker = this.game.activePlayer.board.find((c) => c.instanceId === instanceId);
    if (!attacker || !attacker.canAttack()) return;
    this.selection = { kind: "attacking", attackerInstanceId: instanceId };
    this.renderAll();
  }

  onEndTurn() {
    this.clearSelection();
    this.game.execute(new EndTurnCommand());
    this.renderAll();
  }

  executeAndRender(command) {
    this.game.execute(command);
    this.clearSelection();
    this.renderAll();
  }

  clearSelection() {
    this.selection = null;
  }

  findSelectedCard() {
    if (!this.selection) return null;
    const id = this.selection.instanceId ?? this.selection.attackerInstanceId;
    return this.game.activePlayer.findInstanceAnywhere(id)?.card ?? null;
  }

  renderActionBar() {
    this.actionBar.innerHTML = "";
    this.actionBar.appendChild(this.buildHint());
    if (this.selection) this.actionBar.appendChild(this.buildCancelButton());
    this.appendEndTurnButton();
  }

  buildHint() {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = this.hintText();
    return hint;
  }

  hintText() {
    if (!this.selection) return "Touche une carte de ta main pour la jouer, ou une unite au front pour attaquer.";
    if (this.selection.kind === "awaitingSpellTarget") return "Touche une cible valide (surlignee en pointille).";
    const name = this.findSelectedCard()?.nom ?? "Cette carte";
    return `${name} attaque : touche une cible ennemie valide (surlignee), ou le heros adverse.`;
  }

  appendEndTurnButton() {
    this.actionBar.appendChild(this.buildButton("Fin du tour", "primary", () => this.onEndTurn()));
  }

  buildCancelButton() {
    return this.buildButton("Annuler", "", () => {
      this.clearSelection();
      this.renderAll();
    });
  }

  buildButton(label, extraClass, handler) {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (extraClass) btn.className = extraClass;
    btn.addEventListener("click", handler);
    return btn;
  }
}
