import { LANES } from "../src/constants.js";
import { DeployCommand } from "../src/commands/DeployCommand.js";
import { MoveToTrancheeCommand } from "../src/commands/MoveToTrancheeCommand.js";
import { MoveToFrontCommand } from "../src/commands/MoveToFrontCommand.js";
import { DigTunnelCommand } from "../src/commands/DigTunnelCommand.js";
import { EmergeTunnelCommand } from "../src/commands/EmergeTunnelCommand.js";
import { PlayObjectCommand } from "../src/commands/PlayObjectCommand.js";
import { EndTurnCommand } from "../src/commands/EndTurnCommand.js";
import { ObjectCard } from "../src/core/Card.js";

// Possede l'etat d'interaction transitoire (carte selectionnee, cible en
// attente) et traduit les clics en Command executees sur le Game. Le
// Renderer, lui, ne connait que "quoi dessiner", jamais "quoi faire".
export class InputController {
  constructor(game, renderer, actionBarEl, overlays) {
    this.game = game;
    this.renderer = renderer;
    this.actionBar = actionBarEl;
    this.overlays = overlays; // { pass, victory, showPass, hidePass, showVictory }
    this.selection = null;
  }

  isSelected(instanceId) {
    return Boolean(this.selection) && this.selection.instanceId === instanceId;
  }

  renderAll() {
    this.renderer.render(this.game, { isSelected: (id) => this.isSelected(id) }, {
      onHandCardClick: (id, affordable) => this.onHandCardClick(id, affordable),
      onCardClick: (faction, zone, lane, id) => this.onCardClick(faction, zone, lane, id),
    });
    this.renderActionBar();
  }

  onHandCardClick(instanceId, affordable) {
    if (!affordable) return;
    this.toggleSelection({ kind: "hand", instanceId });
  }

  onCardClick(faction, zone, lane, instanceId) {
    if (this.selection?.kind === "awaitingTarget") {
      this.resolveTargetedObject(instanceId);
      return;
    }
    const isOwn = faction === this.game.active;
    if (!isOwn || zone === "front") return; // on ne selectionne pas les cartes deja au front
    this.toggleSelection({ kind: zone, instanceId, lane });
  }

  toggleSelection(next) {
    const isSame = this.selection && this.selection.kind === next.kind && this.selection.instanceId === next.instanceId;
    this.selection = isSame ? null : next;
    this.renderAll();
  }

  onConfirmLane(lane) {
    if (!this.selection) return;
    const card = this.findSelectedCard();
    if (this.selection.kind === "hand" && card instanceof ObjectCard) {
      this.playObjectOrAwaitTarget(lane, card);
    } else if (this.selection.kind === "hand") {
      this.game.execute(new DeployCommand(this.selection.instanceId, lane));
      this.clearSelectionAndRender();
    } else if (this.selection.kind === "reserve") {
      this.game.execute(new MoveToTrancheeCommand(this.selection.instanceId, lane));
      this.clearSelectionAndRender();
    } else if (this.selection.kind === "tranchee") {
      this.game.execute(new MoveToFrontCommand(this.selection.instanceId, lane));
      this.clearSelectionAndRender();
    }
  }

  playObjectOrAwaitTarget(lane, card) {
    const strategy = this.game.effects.get(card.id);
    if (strategy?.requiresTarget()) {
      this.selection = { kind: "awaitingTarget", instanceId: this.selection.instanceId, lane };
      this.renderAll();
      return;
    }
    this.game.execute(new PlayObjectCommand(this.selection.instanceId, lane));
    this.clearSelectionAndRender();
  }

  resolveTargetedObject(targetInstanceId) {
    const { instanceId, lane } = this.selection;
    this.game.execute(new PlayObjectCommand(instanceId, lane, targetInstanceId));
    this.clearSelectionAndRender();
  }

  onDigTunnel(lane) {
    if (!this.selection || this.selection.kind !== "tranchee") return;
    this.game.execute(new DigTunnelCommand(this.selection.instanceId, lane));
    this.clearSelectionAndRender();
  }

  onEmergeTunnel(lane) {
    this.game.execute(new EmergeTunnelCommand(lane));
    this.renderAll();
  }

  onEndTurn() {
    this.clearSelection();
    this.game.execute(new EndTurnCommand());
    this.renderAll();
    if (this.game.winner) this.overlays.showVictory(this.game.winner);
    else this.overlays.showPass(this.game.active);
  }

  clearSelectionAndRender() {
    this.clearSelection();
    this.renderAll();
  }

  clearSelection() {
    this.selection = null;
  }

  findSelectedCard() {
    if (!this.selection) return null;
    return this.game.activePlayer.findInstanceAnywhere(this.selection.instanceId)?.card ?? this.findInHand();
  }

  findInHand() {
    return this.game.activePlayer.hand.find((c) => c.instanceId === this.selection.instanceId)?.card ?? null;
  }

  renderActionBar() {
    this.actionBar.innerHTML = "";
    this.actionBar.appendChild(this.buildHint());
    if (this.selection && this.selection.kind !== "awaitingTarget") this.appendLaneButtons();
    if (this.selection?.kind === "awaitingTarget") this.appendTargetHint();
    this.appendTunnelButtons();
    this.appendEndTurnButton();
  }

  buildHint() {
    const hint = document.createElement("span");
    hint.style.cssText = "display:block;font-size:11px;color:#8A6B4A;width:100%;text-align:center;";
    hint.textContent = this.hintText();
    return hint;
  }

  hintText() {
    if (!this.selection) return "Selectionne une carte en main, en reserve ou en tranchee.";
    if (this.selection.kind === "awaitingTarget") return "Clique sur la carte a cibler.";
    const card = this.findSelectedCard();
    const name = card?.nom ?? "Carte";
    if (this.selection.kind === "hand") return `${name} selectionnee - choisis une ligne.`;
    if (this.selection.kind === "reserve") return `${name} en reserve - choisis une ligne pour avancer en tranchee.`;
    return `${name} en tranchee - choisis une ligne pour engager au front.`;
  }

  appendLaneButtons() {
    for (const lane of LANES) {
      const btn = document.createElement("button");
      btn.className = "primary";
      btn.textContent = lane.toUpperCase();
      btn.addEventListener("click", () => this.onConfirmLane(lane));
      this.actionBar.appendChild(btn);
    }
    this.actionBar.appendChild(this.buildCancelButton());
  }

  appendTargetHint() {
    this.actionBar.appendChild(this.buildCancelButton());
  }

  buildCancelButton() {
    const btn = document.createElement("button");
    btn.textContent = "Annuler";
    btn.addEventListener("click", () => this.clearSelectionAndRender());
    return btn;
  }

  appendTunnelButtons() {
    for (const lane of LANES) {
      const laneState = this.game.activePlayer.lanes[lane];
      if (this.selection?.kind === "tranchee" && this.selection.lane === lane && !laneState.tunnel) {
        this.actionBar.appendChild(this.buildTunnelButton(`Creuser tunnel (${lane})`, () => this.onDigTunnel(lane)));
      }
      if (laneState.tunnel && !laneState.front) {
        this.actionBar.appendChild(this.buildTunnelButton(`Embuscade (${lane})`, () => this.onEmergeTunnel(lane)));
      }
    }
  }

  buildTunnelButton(label, handler) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", handler);
    return btn;
  }

  appendEndTurnButton() {
    const btn = document.createElement("button");
    btn.textContent = "Fin du tour";
    btn.addEventListener("click", () => this.onEndTurn());
    this.actionBar.appendChild(btn);
  }
}
