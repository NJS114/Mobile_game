import { DeployCommand } from "../src/commands/DeployCommand.js";
import { MoveToTrancheeCommand } from "../src/commands/MoveToTrancheeCommand.js";
import { MoveToFrontCommand } from "../src/commands/MoveToFrontCommand.js";
import { DigTunnelCommand } from "../src/commands/DigTunnelCommand.js";
import { EmergeTunnelCommand } from "../src/commands/EmergeTunnelCommand.js";
import { PlayObjectCommand } from "../src/commands/PlayObjectCommand.js";
import { AttackCommand } from "../src/commands/AttackCommand.js";
import { EndTurnCommand } from "../src/commands/EndTurnCommand.js";
import { ObjectCard } from "../src/core/Card.js";

// Possede l'etat d'interaction transitoire (carte en tranchee selectionnee,
// attaque en cours, cible d'objet en attente) et traduit les clics en
// Command executees sur le Game. La plupart des actions sont a un seul
// clic ; seules celles qui ont un vrai choix (tranchee -> front ou tunnel,
// qui attaquer) demandent une etape supplementaire.
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

  isTargetable(faction, zoneName, instanceId) {
    if (zoneName !== "front") return false;
    if (this.selection?.kind === "attacking") return faction !== this.game.active;
    if (this.selection?.kind === "awaitingObjectTarget") return true;
    return false;
  }

  renderAll() {
    this.renderer.render(
      this.game,
      { isSelected: (id) => this.isSelected(id), isTargetable: (f, z, id) => this.isTargetable(f, z, id) },
      {
        onHandCardClick: (id, affordable) => this.onHandCardClick(id, affordable),
        onCardClick: (faction, zone, id) => this.onCardClick(faction, zone, id),
      }
    );
    this.renderActionBar();
  }

  onHandCardClick(instanceId, affordable) {
    if (!affordable || this.selection) return;
    const card = this.game.activePlayer.hand.find((c) => c.instanceId === instanceId)?.card;
    if (card instanceof ObjectCard) this.playObjectOrAwaitTarget(instanceId, card);
    else this.executeAndRender(new DeployCommand(instanceId));
  }

  playObjectOrAwaitTarget(instanceId, card) {
    const strategy = this.game.effects.get(card.id);
    if (strategy?.requiresTarget()) {
      this.selection = { kind: "awaitingObjectTarget", instanceId };
      this.renderAll();
      return;
    }
    this.executeAndRender(new PlayObjectCommand(instanceId));
  }

  onCardClick(faction, zone, instanceId) {
    if (this.selection?.kind === "awaitingObjectTarget") {
      this.executeAndRender(new PlayObjectCommand(this.selection.instanceId, instanceId));
      return;
    }
    if (zone === "front") {
      this.onFrontCardClick(faction, instanceId);
      return;
    }
    const isOwn = faction === this.game.active;
    if (!isOwn) return;
    if (zone === "reserve") this.executeAndRender(new MoveToTrancheeCommand(instanceId));
    else if (zone === "tranchee") this.toggleTrancheeSelection(instanceId);
  }

  onFrontCardClick(faction, instanceId) {
    const isOwn = faction === this.game.active;
    if (this.selection?.kind === "attacking") {
      if (isOwn) return; // on ne cible pas ses propres cartes
      this.executeAndRender(new AttackCommand(this.selection.attackerInstanceId, instanceId));
      return;
    }
    if (!isOwn) return;
    const attacker = this.game.activePlayer.zones.front.find((c) => c.instanceId === instanceId);
    if (!attacker || attacker.hasAttacked) return;
    this.selection = { kind: "attacking", attackerInstanceId: instanceId };
    this.renderAll();
  }

  toggleTrancheeSelection(instanceId) {
    const isSame = this.selection?.kind === "tranchee" && this.selection.instanceId === instanceId;
    this.selection = isSame ? null : { kind: "tranchee", instanceId };
    this.renderAll();
  }

  onMoveToFront() {
    if (this.selection?.kind !== "tranchee") return;
    this.executeAndRender(new MoveToFrontCommand(this.selection.instanceId));
  }

  onDigTunnel() {
    if (this.selection?.kind !== "tranchee") return;
    this.executeAndRender(new DigTunnelCommand(this.selection.instanceId));
  }

  onEmergeTunnel() {
    this.executeAndRender(new EmergeTunnelCommand());
  }

  onStrikeBase() {
    if (this.selection?.kind !== "attacking") return;
    this.executeAndRender(new AttackCommand(this.selection.attackerInstanceId));
  }

  onEndTurn() {
    this.clearSelection();
    this.game.execute(new EndTurnCommand());
    this.renderAll();
    if (this.game.winner) this.overlays.showVictory(this.game.winner);
    else this.overlays.showPass(this.game.active);
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
    if (this.selection?.kind === "tranchee") this.appendTrancheeButtons();
    if (this.selection?.kind === "attacking") this.appendAttackButtons();
    if (this.selection) this.actionBar.appendChild(this.buildCancelButton());
    this.appendTunnelEmergeButton();
    this.appendEndTurnButton();
  }

  buildHint() {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = this.hintText();
    return hint;
  }

  hintText() {
    if (!this.selection) return "Touche une carte pour agir : deployer, avancer, ou attaquer.";
    if (this.selection.kind === "awaitingObjectTarget") return "Touche la carte a cibler.";
    const name = this.findSelectedCard()?.nom ?? "Carte";
    if (this.selection.kind === "tranchee") return `${name} en tranchee - engager au front ou creuser un tunnel ?`;
    if (this.selection.kind === "attacking") return `${name} attaque - touche une carte ennemie, ou frappe la base si son front est vide.`;
    return "";
  }

  appendTrancheeButtons() {
    const card = this.findSelectedCard();
    this.actionBar.appendChild(this.buildButton("Engager au front", "primary", () => this.onMoveToFront()));
    if (card?.isSapeur?.()) this.actionBar.appendChild(this.buildButton("Creuser un tunnel", "primary", () => this.onDigTunnel()));
  }

  appendAttackButtons() {
    const enemyFaction = this.game.active === "chat" ? "chien" : "chat";
    if (this.game.players[enemyFaction].zones.front.length === 0) {
      this.actionBar.appendChild(this.buildButton("Frapper la base", "primary", () => this.onStrikeBase()));
    }
  }

  appendTunnelEmergeButton() {
    const zones = this.game.activePlayer.zones;
    if (zones.tunnel && zones.hasFreeFrontSlot() && !this.selection) {
      this.actionBar.appendChild(this.buildButton("Embuscade (tunnel)", "", () => this.onEmergeTunnel()));
    }
  }

  appendEndTurnButton() {
    this.actionBar.appendChild(this.buildButton("Fin du tour", "", () => this.onEndTurn()));
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
