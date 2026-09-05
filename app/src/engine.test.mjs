// Suite de tests du moteur (aucun framework, juste des asserts).
// Lancer avec : node app/src/engine.test.mjs
import { CARDS } from "../cards-data.js";
import { Game } from "./Game.js";
import { PlayUnitCommand } from "./commands/PlayUnitCommand.js";
import { PlaySpellCommand } from "./commands/PlaySpellCommand.js";
import { AttackCommand } from "./commands/AttackCommand.js";
import { EndTurnCommand } from "./commands/EndTurnCommand.js";
import { Target } from "./effects/TargetRef.js";

let passed = 0;

function assert(condition, message) {
  if (!condition) throw new Error("ECHEC: " + message);
  passed += 1;
  console.log("OK:", message);
}

function newGame() {
  return new Game(CARDS);
}

// Place une carte precise en main de facon deterministe : on l'extrait
// directement de la pioche plutot que de piocher au hasard jusqu'a tomber
// dessus (ce qui pourrait faire deborder la limite de main dans un test).
function ensureCardInHand(game, playerId, cardId) {
  const player = game.players[playerId];
  const inHand = player.hand.find((c) => c.card.id === cardId);
  if (inHand) return inHand;
  const deckIndex = player.deck.cards.findIndex((c) => c.card.id === cardId);
  if (deckIndex === -1) throw new Error(`Carte introuvable en main/pioche: ${cardId}`);
  const [instance] = player.deck.cards.splice(deckIndex, 1);
  player.hand.push(instance);
  return instance;
}

// Place une carte precise en main et donne assez de mana pour la jouer,
// sans executer de Command (utile pour preparer un sort avant de le jouer
// explicitement avec une cible dans le test).
function giveHandCard(game, playerId, cardId, mana = 99) {
  const player = game.players[playerId];
  player.mana = mana;
  player.manaCap = Math.max(player.manaCap, mana);
  return ensureCardInHand(game, playerId, cardId);
}

function playUnit(game, playerId, cardId, { mana = 99 } = {}) {
  const instance = giveHandCard(game, playerId, cardId, mana);
  game.execute(new PlayUnitCommand(instance.instanceId));
  return instance;
}

function playAnyAffordableUnit(game, playerId, mana = 99) {
  const player = game.players[playerId];
  player.mana = mana;
  player.manaCap = Math.max(player.manaCap, mana);
  const isUnit = (c) => typeof c.card.attaque === "number";
  while (!player.hand.some(isUnit) && !player.deck.isEmpty) {
    player.hand.push(player.deck.draw());
  }
  const instance = player.hand.find(isUnit);
  if (!instance) throw new Error("Plus aucune unite disponible en main/pioche");
  game.execute(new PlayUnitCommand(instance.instanceId));
  return instance;
}

function makeAttackable(instance) {
  instance.summoningSick = false;
  instance.hasAttacked = false;
}

// --- 1. Jouer une unite : cout paye, main -> plateau -------------------
{
  const game = newGame();
  const player = game.players.joueur1;
  const inHand = giveHandCard(game, "joueur1", "robot-petit-automate", 3);
  const before = player.hand.length;
  game.execute(new PlayUnitCommand(inHand.instanceId));
  assert(player.mana === 2, "le mana est bien deduit du cout de la carte");
  assert(player.board.includes(inHand), "la carte jouee arrive sur le plateau");
  assert(player.hand.length === before - 1, "la carte quitte la main");
}

// --- 2. Impossible de jouer une carte trop chere ------------------------
{
  const game = newGame();
  const player = game.players.joueur1;
  player.mana = 0;
  const instance = ensureCardInHand(game, "joueur1", "robot-gardien-botanique");
  const handBefore = player.hand.length;
  game.execute(new PlayUnitCommand(instance.instanceId));
  assert(player.hand.length === handBefore, "la pose est refusee si le mana est insuffisant");
  assert(player.board.length === 0, "aucune carte n'atterrit sur le plateau");
}

// --- 3. Mal de debarquement (summoning sickness) ------------------------
{
  const game = newGame();
  const instance = playUnit(game, "joueur1", "robot-sentinelle-ressort");
  assert(instance.summoningSick === true, "une unite fraichement posee ne peut pas encore attaquer");
  game.execute(new AttackCommand(instance.instanceId, Target.hero("joueur2")));
  assert(game.players.joueur2.hp === 30, "l'attaque est ignoree tant que l'unite est malade du debarquement");
}

// --- 4. Frappe directe sur le heros quand le plateau adverse est vide --
{
  const game = newGame();
  const instance = playUnit(game, "joueur1", "noble-chevalier-royal");
  makeAttackable(instance);
  game.execute(new AttackCommand(instance.instanceId, Target.hero("joueur2")));
  assert(game.players.joueur2.hp === 30 - instance.atq, "le heros adverse encaisse les degats directs");
  assert(instance.hasAttacked === true, "l'attaquant est marque comme ayant attaque");
}

// --- 5. Combat mutuel entre deux unites ---------------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "joueur1", "robot-ingenieure-renarde");
  game.active = "joueur2";
  const defender = playUnit(game, "joueur2", "sante-brancardier-beagle");
  game.active = "joueur1";
  makeAttackable(attacker);

  const attackerAtq = attacker.atq;
  const defenderAtq = defender.atq;
  game.execute(new AttackCommand(attacker.instanceId, defender.instanceId));

  assert(defender.currentPv === defender.maxPv - attackerAtq, "le defenseur encaisse les degats de l'attaquant");
  assert(attacker.currentPv === attacker.maxPv - defenderAtq, "l'attaquant encaisse aussi des degats en retour");
}

// --- 6. Une unite morte est retiree du plateau --------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "joueur1", "robot-automate-siege"); // 5 ATQ
  game.active = "joueur2";
  const defender = playUnit(game, "joueur2", "noble-jeune-noble"); // 2 PV
  game.active = "joueur1";
  makeAttackable(attacker);

  game.execute(new AttackCommand(attacker.instanceId, defender.instanceId));
  assert(!game.players.joueur2.board.includes(defender), "l'unite detruite quitte le plateau");
}

// --- 7. Une seule attaque par unite et par tour -------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "joueur1", "noble-roi-protecteur");
  makeAttackable(attacker);
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("joueur2")));
  const hpAfterFirst = game.players.joueur2.hp;
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("joueur2")));
  assert(game.players.joueur2.hp === hpAfterFirst, "la seconde attaque du meme tour est ignoree");
}

// --- 8. La Garde doit etre ciblee en priorite ---------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "joueur1", "noble-roi-protecteur");
  game.active = "joueur2";
  playUnit(game, "joueur2", "sante-infirmiere-souris"); // pas Garde
  const gardeUnit = playUnit(game, "joueur2", "robot-golem-horlogerie"); // Garde
  game.active = "joueur1";
  makeAttackable(attacker);

  game.execute(new AttackCommand(attacker.instanceId, Target.hero("joueur2")));
  assert(game.players.joueur2.hp === 30, "impossible de frapper le heros tant qu'une Garde est en vie");

  game.execute(new AttackCommand(attacker.instanceId, gardeUnit.instanceId));
  assert(gardeUnit.currentPv < gardeUnit.maxPv, "la Garde ciblee encaisse bien les degats");
}

// --- 9. Le bouclier divin absorbe un seul coup --------------------------
{
  const game = newGame();
  const shielded = playUnit(game, "joueur1", "noble-souveraine-aurelia");
  assert(shielded.hasDivineShield === true, "la legendaire Nobles part avec un bouclier divin");
  const died = shielded.receiveDamage(1);
  assert(died === false && shielded.hasDivineShield === false, "le bouclier absorbe le premier coup sans perte de PV");
  const diedSecondHit = shielded.receiveDamage(1);
  assert(diedSecondHit === false && shielded.currentPv === shielded.maxPv - 1, "le second coup entame vraiment les PV");
}

// --- 10. Synergie de tribu Nobles (seuil 2, +1 attaque) -----------------
{
  const game = newGame();
  const n1 = playUnit(game, "joueur1", "noble-jeune-noble");
  assert(n1.atq === 1, "avec un seul Noble en jeu, aucun bonus de synergie");
  const n2 = playUnit(game, "joueur1", "noble-chambellan");
  assert(n1.atq === 2 && n2.atq === 3, "des que 2 Nobles sont en jeu, chacun gagne +1 attaque");

  game.destroyUnit(n2);
  assert(n1.atq === 1, "la synergie disparait des que le nombre de Nobles repasse sous le seuil");
}

// --- 11. Sort de soin (cible alliee uniquement) -------------------------
{
  const game = newGame();
  const wounded = playUnit(game, "joueur1", "robot-automate-siege");
  wounded.receiveDamage(4);
  const spell = giveHandCard(game, "joueur1", "sort-benediction-legere");
  game.execute(new PlaySpellCommand(spell.instanceId, wounded.instanceId));
  assert(wounded.currentPv === wounded.maxPv - 1, "Benediction Legere rend 3 PV a la cible alliee");
}

// --- 12. Sort de degats (cible ennemie uniquement) ----------------------
{
  const game = newGame();
  const spell = giveHandCard(game, "joueur1", "sort-eclair-arcanique");
  const ally = playUnit(game, "joueur1", "robot-petit-automate");
  const handBefore = game.players.joueur1.hand.length;

  game.execute(new PlaySpellCommand(spell.instanceId, ally.instanceId));
  assert(game.players.joueur1.hand.length === handBefore, "une cible alliee invalide ne consomme pas le sort");
  assert(
    game.players.joueur1.hand.some((c) => c.instanceId === spell.instanceId),
    "le sort reste en main apres une cible refusee"
  );

  game.execute(new PlaySpellCommand(spell.instanceId, Target.hero("joueur2")));
  assert(game.players.joueur2.hp === 30 - 3, "Eclair Arcanique inflige 3 degats au heros ennemi");
}

// --- 13. Sort de pioche sans cible ---------------------------------------
{
  const game = newGame();
  const spell = giveHandCard(game, "joueur1", "sort-savoir-ancestral");
  const handBefore = game.players.joueur1.hand.length;
  game.execute(new PlaySpellCommand(spell.instanceId));
  assert(game.players.joueur1.hand.length === handBefore + 1, "Savoir Ancestral fait piocher 2 cartes (le sort en quitte 1, en ramene 2)");
}

// --- 14. Sort de buff qui accorde la Garde -------------------------------
{
  const game = newGame();
  const ally = playUnit(game, "joueur1", "robot-sentinelle-ressort");
  const spell = giveHandCard(game, "joueur1", "sort-rang-serre");
  assert(ally.isTaunt === false, "l'unite ciblee n'a pas Garde au depart");
  game.execute(new PlaySpellCommand(spell.instanceId, ally.instanceId));
  assert(ally.isTaunt === true, "Rang Serre accorde la Garde a la cible");
  assert(ally.maxPv === 3 + 2, "Rang Serre ajoute +2 PV max a la cible");
}

// --- 15. Sort de destruction plafonne par le cout de la cible -----------
{
  const game = newGame();
  const spell = giveHandCard(game, "joueur1", "sort-jugement-royal");
  game.active = "joueur2";
  const cheap = playUnit(game, "joueur2", "noble-jeune-noble"); // cout 1
  const expensive = playUnit(game, "joueur2", "robot-gardien-botanique"); // cout 6
  game.active = "joueur1";

  game.execute(new PlaySpellCommand(spell.instanceId, expensive.instanceId));
  assert(game.players.joueur2.board.includes(expensive), "Jugement Royal refuse une cible de cout > 3");

  const spell2 = giveHandCard(game, "joueur1", "sort-jugement-royal");
  game.execute(new PlaySpellCommand(spell2.instanceId, cheap.instanceId));
  assert(!game.players.joueur2.board.includes(cheap), "Jugement Royal detruit une cible de cout <= 3");
}

// --- 16. Capacite maximale du plateau ------------------------------------
{
  const game = newGame();
  const player = game.players.joueur1;
  for (let i = 0; i < 8; i++) playAnyAffordableUnit(game, "joueur1");
  assert(player.board.length === 7, "le plateau n'accepte pas plus de 7 unites (BOARD_CAPACITY)");
}

// --- 17. Courbe de mana correcte pour les deux joueurs ------------------
{
  const game = newGame();
  assert(game.players.joueur1.manaCap === 1, "joueur1 commence avec 1 mana");
  game.execute(new EndTurnCommand());
  assert(game.players.joueur2.manaCap === 1, "joueur2 a lui aussi 1 mana sur son tout premier tour");
  game.execute(new EndTurnCommand());
  assert(game.players.joueur1.manaCap === 2, "joueur1 passe a 2 mana sur son deuxieme tour");
  game.execute(new EndTurnCommand());
  assert(game.players.joueur2.manaCap === 2, "joueur2 passe a 2 mana sur son deuxieme tour");
}

// --- 18. Victoire quand les PV du heros tombent a zero ------------------
{
  const game = newGame();
  game.players.joueur2.hp = 3;
  const attacker = playUnit(game, "joueur1", "robot-automate-siege"); // 5 ATQ
  makeAttackable(attacker);
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("joueur2")));
  assert(game.winner === "joueur1", "joueur1 remporte la partie quand le heros adverse tombe a 0 PV ou moins");
}

console.log(`\n${passed} assertions passees.`);
