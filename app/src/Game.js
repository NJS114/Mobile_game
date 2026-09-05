import { otherFaction, factionLabel } from "./constants.js";
import { CardFactory } from "./core/CardFactory.js";
import { CardInstance } from "./core/CardInstance.js";
import { UnitCard } from "./core/Card.js";
import { Deck } from "./core/Deck.js";
import { Player } from "./core/Player.js";
import { EventEmitter } from "./events/EventEmitter.js";
import { EffectRegistry } from "./effects/EffectRegistry.js";
import { VictoryChecker } from "./victory/VictoryChecker.js";
import { SynergyResolver } from "./synergy/SynergyResolver.js";

// Orchestrateur : possede l'etat global et delegue tout le travail a des
// collaborateurs specialises (chacun a une seule responsabilite). Cette
// classe ne fait volontairement presque aucun calcul elle-meme.
export class Game {
  constructor(cardsData) {
    this.catalog = CardFactory.buildCatalog(cardsData);
    this.turn = 1;
    this.active = "chat";
    this.winner = null;
    this.log = ["La partie commence. Tour 1 - Chats."];
    this.events = new EventEmitter();

    this.effects = EffectRegistry.buildDefault();
    this.victoryChecker = VictoryChecker.buildDefault();
    this.synergyResolver = SynergyResolver.buildDefault();

    this.players = { chat: this.createPlayer("chat"), chien: this.createPlayer("chien") };
    // Les Chats commencent deja "dans" leur premier tour (pas de
    // switchActivePlayer pour les y faire entrer) : sans ce marqueur,
    // switchActivePlayer leur donnerait un deuxieme cran de mana des le
    // tour 3 au lieu du tour 3 reel.
    this.players.chat.hasPlayedATurn = true;
  }

  createPlayer(faction) {
    const deck = Deck.shuffled(this.buildDeckInstances(faction));
    return new Player(faction, deck);
  }

  buildDeckInstances(faction) {
    return this.collectDeckCards(faction).map((card) => new CardInstance(card, faction));
  }

  // Prototype sans deckbuilding : chaque camp recoit deux exemplaires de
  // chaque carte non-legendaire et un exemplaire de chaque legendaire parmi
  // les unites de sa propre espece (chat ou chien), plus l'integralite des
  // sorts neutres (voir docs/GAME_DESIGN.md).
  collectDeckCards(faction) {
    const copiesFor = (card) => (card.rarete === "legendaire" ? 1 : 2);
    const deck = [];
    for (const card of this.catalog.values()) {
      if (card instanceof UnitCard && card.espece !== faction) continue;
      for (let i = 0; i < copiesFor(card); i++) deck.push(card);
    }
    return deck;
  }

  get activePlayer() {
    return this.players[this.active];
  }

  get activeLabel() {
    return factionLabel(this.active);
  }

  execute(command) {
    if (this.winner) return;
    command.execute(this);
    this.winner = this.victoryChecker.determineWinner(this);
    if (this.winner) this.log.push(`${factionLabel(this.winner)} remportent la partie !`);
    this.events.emit("stateChanged", this);
  }

  recomputeSynergies() {
    this.synergyResolver.recompute(this);
  }

  destroyUnit(instance) {
    const owner = this.players[instance.ownerId];
    owner.removeFromBoard(instance.instanceId);
    this.log.push(`${instance.card.nom} est detruit.`);
    this.recomputeSynergies();
  }

  // Etourdissement et poison (voir CardInstance) s'appliquent au debut du
  // tour du controleur de l'unite affectee, pas au moment ou le sort est
  // lance.
  applyStartOfTurnStatuses() {
    for (const unit of [...this.activePlayer.board]) {
      if (unit.tickStatusesForNewTurn()) this.destroyUnit(unit);
    }
  }

  switchActivePlayer() {
    this.active = otherFaction(this.active);
    this.turn += 1;
    const player = this.activePlayer;
    // Le premier tour de chaque camp reste a la capacite de mana initiale ;
    // seuls les tours suivants font monter le plafond (voir Game.constructor).
    if (player.hasPlayedATurn) player.gainManaCapacity();
    player.hasPlayedATurn = true;
    player.refillMana();
    player.drawOne();
    player.resetAttacksForNewTurn();
    this.applyStartOfTurnStatuses();
    this.log.push(`Tour ${this.turn} - ${this.activeLabel} (Mana ${player.mana}/${player.manaCap}).`);
  }
}
