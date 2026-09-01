// Test rapide en ligne de commande (node app/engine.test.js) - pas de framework, juste des asserts.
global.CARDS = require("./cards-data.js");
const Engine = require("./engine.js");

function assert(cond, msg) {
  if (!cond) throw new Error("ECHEC: " + msg);
  console.log("OK:", msg);
}

const game = Engine.createGame();
assert(game.active === "chat", "le chat commence");
assert(game.players.chat.hand.length === 5, "main de depart a 5 cartes");
assert(game.players.chien.hand.length === 5, "main de depart a 5 cartes (chien)");

// Deploie une carte abordable de la main chat en reserve centre
const firstCard = game.players.chat.hand.find((id) => Engine.findCard(id).cout <= game.players.chat.pr);
assert(!!firstCard, "au moins une carte abordable en main de depart");
Engine.deploy(game, firstCard, "centre");
assert(game.players.chat.lanes.centre.reserve.includes(firstCard), "carte deployee en reserve");
assert(!game.players.chat.hand.includes(firstCard), "carte retiree de la main");

Engine.moveReserveToTranchee(game, "centre", firstCard);
assert(game.players.chat.lanes.centre.tranchee.includes(firstCard), "carte avancee en tranchee");

Engine.moveTrancheeToFront(game, "centre", firstCard);
assert(game.players.chat.lanes.centre.front === firstCard, "carte engagee au front");

const moralChienAvant = game.players.chien.moral;
Engine.endTurn(game); // combat: chat perce car chien n'a rien au front centre
assert(game.players.chien.moral < moralChienAvant, "le chien perd du moral suite a la percee");
assert(game.active === "chien", "le tour passe au chien");
assert(game.turn === 2, "compteur de tour incremente");

// coupe la comm et verifie qu'on ne peut plus bouger
Engine.cutCommunication(game, "nord");
const chienHandCard = game.players.chien.hand.find((id) => Engine.findCard(id).cout <= game.players.chien.pr);
if (chienHandCard) {
  Engine.deploy(game, chienHandCard, "nord");
  const beforeLen = game.players.chien.lanes.nord.tranchee.filter((x) => x).length;
  Engine.moveReserveToTranchee(game, "nord", chienHandCard);
  const afterLen = game.players.chien.lanes.nord.tranchee.filter((x) => x).length;
  assert(beforeLen === afterLen, "deplacement bloque quand la communication est coupee");
}

console.log("\nTous les tests sont passes.");
