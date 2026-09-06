import { PlayUnitCommand } from "../src/commands/PlayUnitCommand.js";
import { PlaySpellCommand } from "../src/commands/PlaySpellCommand.js";
import { AttackCommand } from "../src/commands/AttackCommand.js";
import { EndTurnCommand } from "../src/commands/EndTurnCommand.js";
import { SpellCard } from "../src/core/Card.js";
import { EffectContext } from "../src/effects/EffectContext.js";
import { Target } from "../src/effects/TargetRef.js";
import { otherFaction } from "../src/constants.js";

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
    if (this.selection?.kind === "placingUnit") return this.isPlacementTargetable(ownerId);
    return false;
  }

  // Une case vide n'a pas d'instanceId : cible propre pour le placement.
  isEmptySlotTargetable(ownerId) {
    return this.selection?.kind === "placingUnit" && this.isPlacementTargetable(ownerId);
  }

  isPlacementTargetable(ownerId) {
    return ownerId === this.game.active;
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
    const defender = this.game.players[otherFaction(this.game.active)];
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
        isEmptySlotTargetable: (ownerId) => this.isEmptySlotTargetable(ownerId),
      },
      {
        onHandCardClick: (id, affordable) => this.onHandCardClick(id, affordable),
        onBoardCardClick: (ownerId, id, index) => this.onBoardCardClick(ownerId, id, index),
        onEmptySlotClick: (ownerId, index) => this.onEmptySlotClick(ownerId, index),
        onHeroClick: (playerId) => this.onHeroClick(playerId),
      }
    );
    this.renderActionBar();
    if (this.game.winner) this.overlays.showVictory(this.game.winner);
  }

  onHandCardClick(instanceId, affordable) {
    if (this.selection) return;
    const instance = this.game.activePlayer.hand.find((c) => c.instanceId === instanceId);
    if (!instance) return;
    if (!affordable) {
      this.explainUnaffordable(instance);
      return;
    }
    if (instance.card instanceof SpellCard) this.playSpellOrAwaitTarget(instanceId, instance.card);
    else this.selectUnitForPlacement(instanceId);
  }

  // Une carte grisee ne dit sinon jamais pourquoi elle refuse le clic (juste
  // pas assez de mana) - on l'explicite dans le journal plutot que de
  // laisser un clic sans effet passer pour un bug.
  explainUnaffordable(instance) {
    const mana = this.game.activePlayer.mana;
    this.game.log.push(
      `Pas assez de mana pour jouer ${instance.card.nom} (cout ${instance.card.cout}, mana disponible ${mana}).`
    );
    this.renderer.renderLog(this.game);
  }

  // Une unite ne part plus directement sur le plateau : on choisit d'abord
  // son emplacement (avant une unite existante, ou en bout de ligne), avec
  // le meme principe de selection en deux temps que le ciblage de sort.
  selectUnitForPlacement(instanceId) {
    this.selection = { kind: "placingUnit", instanceId };
    this.renderAll();
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

  onBoardCardClick(ownerId, instanceId, index) {
    if (this.selection?.kind === "placingUnit") {
      this.tryPlaceUnit(ownerId, index);
      return;
    }
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

  onEmptySlotClick(ownerId, index) {
    if (this.selection?.kind === "placingUnit") this.tryPlaceUnit(ownerId, index);
  }

  // L'index clique devient la position d'insertion : cliquer une unite
  // existante pose la nouvelle carte juste avant elle, cliquer une case vide
  // la pose en bout de ligne (voir Player.addToBoardAt - le plateau reste
  // une liste compacte, sans "trous").
  tryPlaceUnit(ownerId, index) {
    if (!this.isPlacementTargetable(ownerId)) return;
    this.executeAndRender(new PlayUnitCommand(this.selection.instanceId, index));
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
    if (!this.selection) {
      return "Touche une carte de ta main pour la jouer, ou une unite au front pour attaquer. Toute unite qui n'a pas attaque attaquera automatiquement a la fin du tour.";
    }
    if (this.selection.kind === "awaitingSpellTarget") return "Touche une cible valide (surlignee en pointille).";
    if (this.selection.kind === "placingUnit") {
      return "Touche l'emplacement de ton plateau ou poser la carte : devant une unite existante, ou une case vide pour la mettre en bout de ligne.";
    }
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
