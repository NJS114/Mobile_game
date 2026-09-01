import { LANES, otherFaction, factionLabel } from "./constants.js";
import { CardFactory } from "./core/CardFactory.js";
import { CardInstance } from "./core/CardInstance.js";
import { UnitCard, VehicleCard, ObjectCard } from "./core/Card.js";
import { Deck } from "./core/Deck.js";
import { Player } from "./core/Player.js";
import { CommunicationNetwork } from "./core/CommunicationNetwork.js";
import { EventEmitter } from "./events/EventEmitter.js";
import { EffectRegistry } from "./effects/EffectRegistry.js";
import { CombatResolver } from "./combat/CombatResolver.js";
import { VictoryChecker } from "./victory/VictoryChecker.js";

// Orchestrateur : possede l'etat global et delegue tout le travail a des
// collaborateurs specialises (chacun a une seule responsabilite). Cette
// classe ne fait volontairement presque aucun calcul elle-meme.
export class Game {
  constructor(cardsData) {
    this.catalog = CardFactory.buildCatalog(cardsData);
    this.turn = 1;
    this.active = "chat";
    this.winner = null;
    this.log = ["La partie commence. Tour 1 - Chat."];
    this.events = new EventEmitter();

    this.comm = new CommunicationNetwork();
    this.traps = Object.fromEntries(LANES.map((lane) => [lane, null]));
    this.smokeUntil = Object.fromEntries(LANES.map((lane) => [lane, 0]));
    this.controlStreak = { chat: 0, chien: 0 };
    this.flagLane = null;

    this.effects = EffectRegistry.buildDefault();
    this.combatResolver = new CombatResolver();
    this.victoryChecker = VictoryChecker.buildDefault();

    this.players = { chat: this.createPlayer("chat"), chien: this.createPlayer("chien") };
  }

  createPlayer(faction) {
    const deck = Deck.shuffled(this.buildDeckInstances(faction));
    return new Player(faction, deck);
  }

  buildDeckInstances(faction) {
    const defs = this.collectDeckDefs(faction);
    return defs.map((def) => new CardInstance(def, faction));
  }

  collectDeckDefs(faction) {
    const all = [...this.catalog.values()];
    const factionUnits = all.filter((c) => c instanceof UnitCard && !(c instanceof VehicleCard) && c.faction === faction);
    const vehicles = all.filter((c) => c instanceof VehicleCard);
    const objects = all.filter((c) => c instanceof ObjectCard && (c.faction === faction || c.faction === "neutre"));
    // Deux exemplaires de chaque unite de faction, comme prevu au GDD.
    return [...factionUnits, ...factionUnits, ...vehicles, ...objects];
  }

  get activePlayer() {
    return this.players[this.active];
  }

  get activeFactionLabel() {
    return this.factionLabel(this.active);
  }

  factionLabel(faction) {
    return factionLabel(faction);
  }

  execute(command) {
    if (this.winner) return;
    command.execute(this);
    this.events.emit("stateChanged", this);
  }

  advanceTunnelHiding() {
    for (const lane of LANES) {
      this.advanceTunnelHidingForLane(lane);
    }
  }

  advanceTunnelHidingForLane(lane) {
    const state = this.activePlayer.lanes[lane];
    if (!state.tunnel) return;
    state.tunnelTurnsHidden += 1;
    if (state.tunnelTurnsHidden > 2) this.forceEmergeTunnel(lane);
  }

  forceEmergeTunnel(lane) {
    const state = this.activePlayer.lanes[lane];
    const instance = state.tunnel;
    state.tunnel = null;
    state.tunnelTurnsHidden = 0;

    if (!state.front) {
      state.front = instance;
      this.log.push(`${instance.card.nom} doit ressortir du tunnel au front (${lane}).`);
    } else if (state.placeInTranchee(instance)) {
      this.log.push(`${instance.card.nom} ressort du tunnel en tranchee (${lane}).`);
    } else {
      state.reserve.push(instance);
      this.log.push(`${instance.card.nom} ressort du tunnel en reserve, faute de place (${lane}).`);
    }
  }

  switchActivePlayer() {
    this.active = otherFaction(this.active);
    this.turn += 1;
    this.activePlayer.gainPR();
    this.activePlayer.drawUpTo();
    this.log.push(`Tour ${this.turn} - ${this.activeFactionLabel} (PR: ${this.activePlayer.pr}).`);
  }
}
