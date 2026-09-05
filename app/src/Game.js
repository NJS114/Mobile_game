import { otherPlayer, playerLabel } from "./constants.js";
import { CardFactory } from "./core/CardFactory.js";
import { CardInstance } from "./core/CardInstance.js";
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
    this.active = "joueur1";
    this.winner = null;
    this.log = ["La partie commence. Tour 1 - Joueur 1."];
    this.events = new EventEmitter();

    this.effects = EffectRegistry.buildDefault();
    this.victoryChecker = VictoryChecker.buildDefault();
    this.synergyResolver = SynergyResolver.buildDefault();

    this.players = { joueur1: this.createPlayer("joueur1"), joueur2: this.createPlayer("joueur2") };
    // Joueur 1 commence deja "dans" son premier tour (pas de switchActivePlayer
    // pour l'y faire entrer) : sans ce marqueur, switchActivePlayer lui
    // donnerait un deuxieme cran de mana des le tour 3 au lieu du tour 3 reel.
    this.players.joueur1.hasPlayedATurn = true;
  }

  createPlayer(playerId) {
    const deck = Deck.shuffled(this.buildDeckInstances(playerId));
    return new Player(playerId, deck);
  }

  buildDeckInstances(ownerId) {
    return this.collectDeckCards().map((card) => new CardInstance(card, ownerId));
  }

  // Prototype sans deckbuilding : chaque joueur recoit deux exemplaires de
  // chaque carte non-legendaire et un exemplaire de chaque legendaire, dans
  // le meme miroir de collection (voir docs/GAME_DESIGN.md).
  collectDeckCards() {
    const copiesFor = (card) => (card.rarete === "legendaire" ? 1 : 2);
    const deck = [];
    for (const card of this.catalog.values()) {
      for (let i = 0; i < copiesFor(card); i++) deck.push(card);
    }
    return deck;
  }

  get activePlayer() {
    return this.players[this.active];
  }

  get activeLabel() {
    return playerLabel(this.active);
  }

  execute(command) {
    if (this.winner) return;
    command.execute(this);
    this.winner = this.victoryChecker.determineWinner(this);
    if (this.winner) this.log.push(`${playerLabel(this.winner)} remporte la partie !`);
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

  switchActivePlayer() {
    this.active = otherPlayer(this.active);
    this.turn += 1;
    const player = this.activePlayer;
    // Le premier tour de chaque joueur reste a la capacite de mana initiale ;
    // seuls les tours suivants font monter le plafond (voir Game.constructor).
    if (player.hasPlayedATurn) player.gainManaCapacity();
    player.hasPlayedATurn = true;
    player.refillMana();
    player.drawOne();
    player.resetAttacksForNewTurn();
    this.log.push(`Tour ${this.turn} - ${this.activeLabel} (Mana ${player.mana}/${player.manaCap}).`);
  }
}
