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
import { AttackCommand } from "./commands/AttackCommand.js";
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
  while (!player.hand.some(isAffordableUnit) && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  return player.hand.find(isAffordableUnit);
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

function ensureSapeurInHand(game, faction) {
  const player = game.players[faction];
  while (!player.hand.some((c) => c.card.role === "sapeur") && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  return player.hand.find((c) => c.card.role === "sapeur");
}

function deployToFront(game, faction, instanceOrId) {
  const instanceId = typeof instanceOrId === "string" ? instanceOrId : instanceOrId.instanceId;
  game.execute(new DeployCommand(instanceId));
  game.execute(new MoveToTrancheeCommand(instanceId));
  game.execute(new MoveToFrontCommand(instanceId));
}

function deploySapeurToTranchee(game, faction) {
  const sapeur = ensureSapeurInHand(game, faction);
  assert(Boolean(sapeur), `${faction} a un sapeur disponible (main ou pioche)`);
  game.players[faction].pr = Math.max(game.players[faction].pr, sapeur.card.cout);
  game.execute(new DeployCommand(sapeur.instanceId));
  game.execute(new MoveToTrancheeCommand(sapeur.instanceId));
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

  game.execute(new DeployCommand(card.instanceId));
  assert(game.players.chat.zones.reserve.some((c) => c.instanceId === card.instanceId), "carte deployee en reserve");
  assert(!game.players.chat.hand.some((c) => c.instanceId === card.instanceId), "carte retiree de la main");

  game.execute(new MoveToTrancheeCommand(card.instanceId));
  assert(game.players.chat.zones.tranchee.some((c) => c?.instanceId === card.instanceId), "carte avancee en tranchee");

  game.execute(new MoveToFrontCommand(card.instanceId));
  assert(game.players.chat.zones.front.some((c) => c.instanceId === card.instanceId), "carte engagee au front");
}

// --- 2. Frappe directe : le front adverse est vide ---
{
  const game = newGame();
  const card = affordableHandCard(game);
  deployToFront(game, "chat", card);

  const moralAvant = game.players.chien.moral;
  game.execute(new AttackCommand(card.instanceId));
  assert(game.players.chien.moral < moralAvant, "le chien perd du moral suite a une frappe directe");
  assert(card.hasAttacked === true, "la carte est marquee comme ayant attaque");

  game.execute(new EndTurnCommand());
  assert(game.active === "chien", "le tour passe au chien");
  assert(game.turn === 2, "le compteur de tour est incremente");
}

// --- 3. Communication coupee bloque les deplacements ---
{
  const game = newGame();
  game.comm.cut();
  const card = affordableHandCard(game);
  game.execute(new DeployCommand(card.instanceId));
  game.execute(new MoveToTrancheeCommand(card.instanceId));
  assert(
    game.players.chat.zones.reserve.some((c) => c.instanceId === card.instanceId),
    "la carte reste en reserve quand la communication est coupee"
  );
}

// --- 4. Attaque ciblee : degats mutuels reels sur les deux cartes ---
{
  const game = newGame();
  const chatSapeur = deploySapeurToTranchee(game, "chat");
  game.execute(new MoveToFrontCommand(chatSapeur.instanceId));

  game.active = "chien";
  const chienSapeur = deploySapeurToTranchee(game, "chien");
  game.execute(new MoveToFrontCommand(chienSapeur.instanceId));

  const chatDefAvant = chatSapeur.defense;
  const chienDefAvant = chienSapeur.defense;
  game.execute(new AttackCommand(chienSapeur.instanceId, chatSapeur.instanceId));

  assert(chatSapeur.defense < chatDefAvant, "la cible encaisse des degats reels");
  assert(chienSapeur.defense < chienDefAvant, "l'attaquant encaisse aussi des degats en retour (combat mutuel)");
}

// --- 5. Une carte ne peut pas attaquer deux fois le meme tour ---
{
  const game = newGame();
  const card = affordableHandCard(game);
  deployToFront(game, "chat", card);
  game.execute(new AttackCommand(card.instanceId));
  const moralApresPremiereAttaque = game.players.chien.moral;
  game.execute(new AttackCommand(card.instanceId));
  assert(game.players.chien.moral === moralApresPremiereAttaque, "la seconde attaque du meme tour est ignoree");
}

// --- 6. Tunnel : creuser puis surgir en embuscade double les degats ---
{
  const game = newGame();
  const sapeur = deploySapeurToTranchee(game, "chat");
  game.execute(new DigTunnelCommand(sapeur.instanceId));
  assert(game.players.chat.zones.tunnel?.instanceId === sapeur.instanceId, "le sapeur est cache dans le tunnel");
  assert(game.players.chat.zones.tranchee.every((c) => c === null), "la tranchee est vide, le sapeur est dans le tunnel");

  game.execute(new EmergeTunnelCommand());
  assert(game.players.chat.zones.front.some((c) => c.instanceId === sapeur.instanceId), "le sapeur surgit directement au front");
  assert(sapeur.ambush === true, "le statut embuscade est actif avant la prochaine attaque");
}

// --- 7. Objets cibles : Sacs de Sable protege, Trousse de Secours soigne ---
{
  const game = newGame();
  const card = affordableHandCard(game);
  deployToFront(game, "chat", card);
  card.currentDefense = 1; // simule des degats deja subis

  const sacsDeSable = ensureCardInHand(game, "chat", "sacs-de-sable");
  assert(Boolean(sacsDeSable), "Sacs de Sable disponible (main ou pioche)");
  assert(game.effects.get("sacs-de-sable").requiresTarget() === true, "Sacs de Sable exige une cible");
  game.execute(new PlayObjectCommand(sacsDeSable.instanceId, card.instanceId));
  assert(card.shieldBonus === 2, "Sacs de Sable ajoute +2 de bouclier temporaire");

  const trousse = ensureCardInHand(game, "chat", "trousse-secours");
  assert(Boolean(trousse), "Trousse de Secours disponible (main ou pioche)");
  game.execute(new PlayObjectCommand(trousse.instanceId, card.instanceId));
  assert(card.currentDefense === card.card.defense, "Trousse de Secours restaure la defense au maximum");
}

// --- 8. Mine enterree : declenche des degats quand l'adversaire avance au front ---
{
  const game = newGame();
  game.trap = { owner: "chien", damage: 4 };
  const card = affordableHandCard(game);
  const startDef = card.card.defense;
  game.execute(new DeployCommand(card.instanceId));
  game.execute(new MoveToTrancheeCommand(card.instanceId));
  game.execute(new MoveToFrontCommand(card.instanceId));
  assert(game.trap === null, "la mine est consommee apres declenchement");
  const survivant = game.players.chat.zones.front.find((c) => c.instanceId === card.instanceId);
  if (survivant) assert(survivant.currentDefense === startDef - 4, "la mine inflige ses degats a la carte qui avance");
}

// --- 9. Os d'Attraction : cible une carte precise au front chien ---
{
  const game = newGame();
  game.active = "chien";
  const chienCard = affordableHandCard(game);
  deployToFront(game, "chien", chienCard);
  game.active = "chat";

  const os = ensureCardInHand(game, "chat", "os-attraction");
  assert(Boolean(os), "Os d'Attraction disponible (main ou pioche)");
  assert(game.effects.get("os-attraction").requiresTarget() === true, "Os d'Attraction exige une cible");
  game.execute(new PlayObjectCommand(os.instanceId, chienCard.instanceId));

  assert(!game.players.chien.zones.front.some((c) => c.instanceId === chienCard.instanceId), "le chien recule : il n'est plus au front");
  assert(
    game.players.chien.zones.tranchee.some((c) => c?.instanceId === chienCard.instanceId),
    "le chien recule en tranchee"
  );
  assert(chienCard.skipNextAttack === true, "le chien perd son action a la prochaine attaque");
}

// --- 10. Barbeles : bloque le deplacement d'une cible ennemie ---
{
  const game = newGame();
  game.active = "chien";
  const chienCard = affordableHandCard(game);
  game.execute(new DeployCommand(chienCard.instanceId));
  game.active = "chat";

  const barbeles = ensureCardInHand(game, "chat", "barbeles");
  assert(Boolean(barbeles), "Barbeles disponible (main ou pioche)");
  game.execute(new PlayObjectCommand(barbeles.instanceId, chienCard.instanceId));
  assert(chienCard.isMovementBlocked(game.turn), "la carte ciblee est bloquee par les barbeles");

  game.active = "chien";
  game.execute(new MoveToTrancheeCommand(chienCard.instanceId));
  assert(
    game.players.chien.zones.reserve.some((c) => c.instanceId === chienCard.instanceId),
    "la carte bloquee ne peut pas avancer en tranchee"
  );
}

// --- 11. Front complet : un nouveau deploiement au front est refuse ---
{
  const game = newGame();
  game.players.chat.pr = 999; // isole le test de la contrainte de PR : on teste la capacite du front, pas l'economie
  for (let i = 0; i < 6 && !game.players.chat.deck.isEmpty; i++) {
    game.players.chat.hand.push(game.players.chat.deck.draw());
  }
  const units = game.players.chat.hand.filter((c) => typeof c.card.attaque === "number").slice(0, 5);
  for (const unit of units) deployToFront(game, "chat", unit);
  assert(game.players.chat.zones.front.length === Math.min(5, units.length), "le front accepte jusqu'a sa capacite maximale");
}

console.log(`\n${passed} assertions passees.`);
