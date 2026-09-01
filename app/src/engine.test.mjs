// Suite de tests du moteur (aucun framework, juste des asserts).
// Lancer avec : node app/src/engine.test.mjs
import { CARDS } from "../cards-data.js";
import { Game } from "./Game.js";
import { DeployCommand } from "./commands/DeployCommand.js";
import { MoveToTrancheeCommand } from "./commands/MoveToTrancheeCommand.js";
import { MoveToFrontCommand } from "./commands/MoveToFrontCommand.js";
import { DigTunnelCommand } from "./commands/DigTunnelCommand.js";
import { EmergeTunnelCommand } from "./commands/EmergeTunnelCommand.js";
import { PlayObjectCommand } from "./commands/PlayObjectCommand.js";
import { EndTurnCommand } from "./commands/EndTurnCommand.js";

let passed = 0;

function assert(condition, message) {
  if (!condition) throw new Error("ECHEC: " + message);
  passed += 1;
  console.log("OK:", message);
}

function newGame() {
  return new Game(CARDS);
}

function affordableHandCard(game) {
  const player = game.activePlayer;
  const isAffordableUnit = (c) => player.canAfford(c.card) && typeof c.card.attaque === "number";
  // On ecarte les cartes objet (pas de stats de combat). Si le tirage initial
  // n'en propose pas, on pioche jusqu'a en trouver une (uniquement pour les tests).
  while (!player.hand.some(isAffordableUnit) && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  return player.hand.find(isAffordableUnit);
}

function ensureSapeurInHand(game, faction) {
  const player = game.players[faction];
  while (!player.hand.some((c) => c.card.role === "sapeur") && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  return player.hand.find((c) => c.card.role === "sapeur");
}

function ensureCardInHand(game, faction, cardId) {
  const player = game.players[faction];
  while (!player.hand.some((c) => c.card.id === cardId) && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  const instance = player.hand.find((c) => c.card.id === cardId);
  if (instance) player.pr = Math.max(player.pr, instance.card.cout);
  return instance;
}

function deploySapeurToTranchee(game, faction, lane) {
  const sapeur = ensureSapeurInHand(game, faction);
  assert(Boolean(sapeur), `${faction} a un sapeur disponible (main ou pioche)`);
  // Le cout du sapeur peut depasser les PR de depart (3) : on force le
  // niveau de PR necessaire, le but du test etant le combat, pas l'economie.
  game.players[faction].pr = Math.max(game.players[faction].pr, sapeur.card.cout);
  game.execute(new DeployCommand(sapeur.instanceId, lane));
  game.execute(new MoveToTrancheeCommand(sapeur.instanceId, lane));
  return sapeur;
}

// --- 1. Deploiement de base ---
{
  const game = newGame();
  assert(game.active === "chat", "le chat commence");
  assert(game.players.chat.hand.length === 5, "main de depart a 5 cartes (chat)");
  assert(game.players.chien.hand.length === 5, "main de depart a 5 cartes (chien)");

  const card = affordableHandCard(game);
  assert(Boolean(card), "au moins une carte abordable en main de depart");

  game.execute(new DeployCommand(card.instanceId, "centre"));
  assert(game.players.chat.lanes.centre.reserve.some((c) => c.instanceId === card.instanceId), "carte deployee en reserve");
  assert(!game.players.chat.hand.some((c) => c.instanceId === card.instanceId), "carte retiree de la main");

  game.execute(new MoveToTrancheeCommand(card.instanceId, "centre"));
  assert(game.players.chat.lanes.centre.tranchee.some((c) => c?.instanceId === card.instanceId), "carte avancee en tranchee");

  game.execute(new MoveToFrontCommand(card.instanceId, "centre"));
  assert(game.players.chat.lanes.centre.front?.instanceId === card.instanceId, "carte engagee au front");
}

// --- 2. Percee au combat (front adverse vide) ---
{
  const game = newGame();
  const card = affordableHandCard(game);
  game.execute(new DeployCommand(card.instanceId, "nord"));
  game.execute(new MoveToTrancheeCommand(card.instanceId, "nord"));
  game.execute(new MoveToFrontCommand(card.instanceId, "nord"));

  const moralAvant = game.players.chien.moral;
  game.execute(new EndTurnCommand());
  assert(game.players.chien.moral < moralAvant, "le chien perd du moral suite a une percee");
  assert(game.active === "chien", "le tour passe au chien");
  assert(game.turn === 2, "le compteur de tour est incremente");
}

// --- 3. Communication coupee bloque les deplacements ---
{
  const game = newGame();
  game.comm.cut("sud");
  const card = affordableHandCard(game);
  game.execute(new DeployCommand(card.instanceId, "sud"));
  game.execute(new MoveToTrancheeCommand(card.instanceId, "sud"));
  assert(
    game.players.chat.lanes.sud.reserve.some((c) => c.instanceId === card.instanceId),
    "la carte reste en reserve quand la communication est coupee"
  );
}

// --- 4. Combat mutuel : les degats s'accumulent sur plusieurs tours (vraie reserve de vie) ---
{
  const game = newGame();
  const chatCard = deploySapeurToTranchee(game, "chat", "centre"); // 2 def, 8 def cote chien selon le roster
  game.execute(new MoveToFrontCommand(chatCard.instanceId, "centre"));
  game.execute(new EndTurnCommand()); // chat->chien, combat: chat seul au front => percee, pas de mutuel
  // Le chien engage aussi son sapeur au front pour forcer un combat mutuel au tour suivant.
  const chienSapeur = deploySapeurToTranchee(game, "chien", "centre");
  game.execute(new MoveToFrontCommand(chienSapeur.instanceId, "centre"));
  const chatDefAvant = chatCard.defense;
  game.execute(new EndTurnCommand()); // resout le combat mutuel centre
  assert(chatCard.defense < chatDefAvant || chatCard.currentDefense <= 0, "le sapeur chat encaisse des degats reels lors du combat mutuel");
}

// --- 5. Tunnel : creuser puis surgir en embuscade double les degats ---
{
  const game = newGame();
  const sapeur = deploySapeurToTranchee(game, "chat", "nord");
  game.execute(new DigTunnelCommand(sapeur.instanceId, "nord"));
  assert(game.players.chat.lanes.nord.tunnel?.instanceId === sapeur.instanceId, "le sapeur est cache dans le tunnel");
  assert(game.players.chat.lanes.nord.tranchee.every((c) => c === null), "la tranchee est vide, le sapeur est dans le tunnel");

  game.execute(new EmergeTunnelCommand("nord"));
  assert(game.players.chat.lanes.nord.front?.instanceId === sapeur.instanceId, "le sapeur surgit directement au front");
  assert(sapeur.ambush === true, "le statut embuscade est actif avant le prochain combat");
}

// --- 6. Objet : Sacs de Sable protege le front, Trousse de Secours soigne ---
{
  const game = newGame();
  const card = affordableHandCard(game);
  game.execute(new DeployCommand(card.instanceId, "centre"));
  game.execute(new MoveToTrancheeCommand(card.instanceId, "centre"));
  game.execute(new MoveToFrontCommand(card.instanceId, "centre"));
  card.currentDefense = 1; // simule des degats deja subis

  const sacsDeSable = ensureCardInHand(game, "chat", "sacs-de-sable");
  assert(Boolean(sacsDeSable), "Sacs de Sable disponible (main ou pioche)");
  game.execute(new PlayObjectCommand(sacsDeSable.instanceId, "centre"));
  assert(card.shieldBonus === 2, "Sacs de Sable ajoute +2 de bouclier temporaire");

  const trousse = ensureCardInHand(game, "chat", "trousse-secours");
  assert(Boolean(trousse), "Trousse de Secours disponible (main ou pioche)");
  game.execute(new PlayObjectCommand(trousse.instanceId, "centre"));
  assert(card.currentDefense === card.card.defense, "Trousse de Secours restaure la defense au maximum");
}

// --- 7. Mine enterree : declenche des degats quand l'adversaire avance au front ---
{
  const game = newGame();
  game.traps.centre = { owner: "chien", damage: 4 };
  const card = affordableHandCard(game);
  const startDef = card.card.defense;
  game.execute(new DeployCommand(card.instanceId, "centre"));
  game.execute(new MoveToTrancheeCommand(card.instanceId, "centre"));
  game.execute(new MoveToFrontCommand(card.instanceId, "centre"));
  assert(game.traps.centre === null, "la mine est consommee apres declenchement");
  const survivant = game.players.chat.lanes.centre.front;
  if (survivant) assert(survivant.currentDefense === startDef - 4, "la mine inflige ses degats a la carte qui avance");
}

// --- 8. Os d'Attraction : cible le front chien, le fait reculer et lui fait perdre son action ---
{
  const game = newGame();
  game.active = "chien";
  const chienCard = affordableHandCard(game);
  game.execute(new DeployCommand(chienCard.instanceId, "centre"));
  game.execute(new MoveToTrancheeCommand(chienCard.instanceId, "centre"));
  game.execute(new MoveToFrontCommand(chienCard.instanceId, "centre"));
  game.active = "chat";

  const os = ensureCardInHand(game, "chat", "os-attraction");
  assert(Boolean(os), "Os d'Attraction disponible (main ou pioche)");
  assert(game.effects.get("os-attraction").requiresTarget() === true, "Os d'Attraction exige une cible");
  game.execute(new PlayObjectCommand(os.instanceId, "centre", chienCard.instanceId));

  assert(game.players.chien.lanes.centre.front === null, "le chien recule : le front est libere");
  assert(
    game.players.chien.lanes.centre.tranchee.some((c) => c?.instanceId === chienCard.instanceId),
    "le chien recule en tranchee"
  );
  assert(chienCard.skipNextAttack === true, "le chien perd son action au prochain combat");
}

// --- 9. Barbeles : bloque le deplacement d'une cible ennemie ---
{
  const game = newGame();
  game.active = "chien";
  const chienCard = affordableHandCard(game);
  const chienInstanceId = chienCard.instanceId;
  game.execute(new DeployCommand(chienInstanceId, "sud"));
  game.active = "chat";

  const barbeles = ensureCardInHand(game, "chat", "barbeles");
  assert(Boolean(barbeles), "Barbeles disponible (main ou pioche)");
  game.execute(new PlayObjectCommand(barbeles.instanceId, "sud", chienInstanceId));
  assert(chienCard.isMovementBlocked(game.turn), "la carte ciblee est bloquee par les barbeles");

  game.active = "chien";
  game.execute(new MoveToTrancheeCommand(chienInstanceId, "sud"));
  assert(
    game.players.chien.lanes.sud.reserve.some((c) => c.instanceId === chienInstanceId),
    "la carte bloquee ne peut pas avancer en tranchee"
  );
}

console.log(`\n${passed} assertions passees.`);
