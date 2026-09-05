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
function ensureCardInHand(game, faction, cardId) {
  const player = game.players[faction];
  const inHand = player.hand.find((c) => c.card.id === cardId);
  if (inHand) return inHand;
  const deckIndex = player.deck.cards.findIndex((c) => c.card.id === cardId);
  if (deckIndex === -1) throw new Error(`Carte introuvable en main/pioche pour ${faction}: ${cardId}`);
  const [instance] = player.deck.cards.splice(deckIndex, 1);
  player.hand.push(instance);
  return instance;
}

// Place une carte precise en main et donne assez de mana pour la jouer,
// sans executer de Command (utile pour preparer un sort avant de le jouer
// explicitement avec une cible dans le test).
function giveHandCard(game, faction, cardId, mana = 99) {
  const player = game.players[faction];
  player.mana = mana;
  player.manaCap = Math.max(player.manaCap, mana);
  return ensureCardInHand(game, faction, cardId);
}

function playUnit(game, faction, cardId, { mana = 99 } = {}) {
  const instance = giveHandCard(game, faction, cardId, mana);
  game.execute(new PlayUnitCommand(instance.instanceId));
  return instance;
}

function playAnyAffordableUnit(game, faction, mana = 99) {
  const player = game.players[faction];
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
  const player = game.players.chat;
  const inHand = giveHandCard(game, "chat", "robot-petit-automate", 3);
  const before = player.hand.length;
  game.execute(new PlayUnitCommand(inHand.instanceId));
  assert(player.mana === 2, "le mana est bien deduit du cout de la carte");
  assert(player.board.includes(inHand), "la carte jouee arrive sur le plateau");
  assert(player.hand.length === before - 1, "la carte quitte la main");
}

// --- 2. Impossible de jouer une carte trop chere ------------------------
{
  const game = newGame();
  const player = game.players.chat;
  player.mana = 0;
  const instance = ensureCardInHand(game, "chat", "noble-souveraine-aurelia");
  const handBefore = player.hand.length;
  game.execute(new PlayUnitCommand(instance.instanceId));
  assert(player.hand.length === handBefore, "la pose est refusee si le mana est insuffisant");
  assert(player.board.length === 0, "aucune carte n'atterrit sur le plateau");
}

// --- 3. Decks separes par espece (Chats vs Chiens) ----------------------
{
  const game = newGame();
  const chatPool = [...game.players.chat.deck.cards, ...game.players.chat.hand];
  const chienPool = [...game.players.chien.deck.cards, ...game.players.chien.hand];
  assert(chatPool.every((c) => c.card.espece !== "chien"), "le deck/main des Chats ne contient aucune unite Chien");
  assert(chienPool.every((c) => c.card.espece !== "chat"), "le deck/main des Chiens ne contient aucune unite Chat");
}

// --- 4. Mal de debarquement (summoning sickness) ------------------------
{
  const game = newGame();
  const instance = playUnit(game, "chat", "robot-petit-automate");
  assert(instance.summoningSick === true, "une unite fraichement posee ne peut pas encore attaquer");
  game.execute(new AttackCommand(instance.instanceId, Target.hero("chien")));
  assert(game.players.chien.hp === 30, "l'attaque est ignoree tant que l'unite est malade du debarquement");
}

// --- 5. Frappe directe sur le heros quand le plateau adverse est vide --
{
  const game = newGame();
  const instance = playUnit(game, "chat", "noble-comtesse-elegante");
  makeAttackable(instance);
  game.execute(new AttackCommand(instance.instanceId, Target.hero("chien")));
  assert(game.players.chien.hp === 30 - instance.atq, "le heros adverse encaisse les degats directs");
  assert(instance.hasAttacked === true, "l'attaquant est marque comme ayant attaque");
}

// --- 6. Combat mutuel entre deux unites ---------------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "chat", "noble-chambellan");
  game.active = "chien";
  const defender = playUnit(game, "chien", "sante-brancardier-beagle");
  game.active = "chat";
  makeAttackable(attacker);

  const attackerAtq = attacker.atq;
  const defenderAtq = defender.atq;
  game.execute(new AttackCommand(attacker.instanceId, defender.instanceId));

  assert(defender.currentPv === defender.maxPv - attackerAtq, "le defenseur encaisse les degats de l'attaquant");
  assert(attacker.currentPv === attacker.maxPv - defenderAtq, "l'attaquant encaisse aussi des degats en retour");
}

// --- 7. Une unite morte est retiree du plateau --------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "chat", "robot-automate-siege"); // 5 ATQ
  game.active = "chien";
  const defender = playUnit(game, "chien", "noble-jeune-noble"); // 2 PV
  game.active = "chat";
  makeAttackable(attacker);

  game.execute(new AttackCommand(attacker.instanceId, defender.instanceId));
  assert(!game.players.chien.board.includes(defender), "l'unite detruite quitte le plateau");
}

// --- 8. Une seule attaque par unite et par tour -------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "chat", "noble-comtesse-elegante");
  makeAttackable(attacker);
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("chien")));
  const hpAfterFirst = game.players.chien.hp;
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("chien")));
  assert(game.players.chien.hp === hpAfterFirst, "la seconde attaque du meme tour est ignoree");
}

// --- 9. La Garde doit etre ciblee en priorite ---------------------------
{
  const game = newGame();
  const attacker = playUnit(game, "chat", "noble-comtesse-elegante");
  game.active = "chien";
  playUnit(game, "chien", "sante-infirmiere-souris"); // pas Garde
  const gardeUnit = playUnit(game, "chien", "robot-gardien-botanique"); // Garde
  game.active = "chat";
  makeAttackable(attacker);

  game.execute(new AttackCommand(attacker.instanceId, Target.hero("chien")));
  assert(game.players.chien.hp === 30, "impossible de frapper le heros tant qu'une Garde est en vie");

  game.execute(new AttackCommand(attacker.instanceId, gardeUnit.instanceId));
  assert(gardeUnit.currentPv < gardeUnit.maxPv, "la Garde ciblee encaisse bien les degats");
}

// --- 10. Le bouclier divin absorbe un seul coup --------------------------
{
  const game = newGame();
  const shielded = playUnit(game, "chat", "noble-souveraine-aurelia");
  assert(shielded.hasDivineShield === true, "la legendaire Nobles chat part avec un bouclier divin");
  const died = shielded.receiveDamage(1);
  assert(died === false && shielded.hasDivineShield === false, "le bouclier absorbe le premier coup sans perte de PV");
  const diedSecondHit = shielded.receiveDamage(1);
  assert(diedSecondHit === false && shielded.currentPv === shielded.maxPv - 1, "le second coup entame vraiment les PV");
}

// --- 11. Synergie de tribu Nobles (seuil 2, +1 attaque au camp) ---------
{
  const game = newGame();
  const n1 = playUnit(game, "chat", "noble-chambellan");
  assert(n1.atq === 2, "avec un seul Noble en jeu, aucun bonus de synergie");
  const n2 = playUnit(game, "chat", "noble-comtesse-elegante");
  assert(n1.atq === 3 && n2.atq === 3, "des que 2 Nobles sont en jeu, chacun gagne +1 attaque");

  game.destroyUnit(n2);
  assert(n1.atq === 2, "la synergie disparait des que le nombre de Nobles repasse sous le seuil");
}

// --- 12. Synergie Robots : buff au camp + debuff a l'adversaire ---------
{
  const game = newGame();
  game.active = "chien";
  const enemy = playUnit(game, "chien", "noble-jeune-noble");
  game.active = "chat";
  assert(enemy.atq === 1, "sans Robots adverses en jeu, aucun malus");

  playUnit(game, "chat", "robot-petit-automate");
  const r2 = playUnit(game, "chat", "robot-golem-horlogerie");
  assert(r2.atq === 2 + 1, "des que 2 Robots chat sont en jeu, chacun gagne +1 attaque");
  assert(enemy.atq === 0, "la meme synergie Robots inflige -1 attaque a tout le plateau adverse (plafonne a 0)");
}

// --- 13. Sort de soin (cible alliee uniquement) -------------------------
{
  const game = newGame();
  const wounded = playUnit(game, "chat", "robot-automate-siege");
  wounded.receiveDamage(4);
  const spell = giveHandCard(game, "chat", "sort-benediction-legere");
  game.execute(new PlaySpellCommand(spell.instanceId, wounded.instanceId));
  assert(wounded.currentPv === wounded.maxPv - 1, "Benediction Legere rend 3 PV a la cible alliee");
}

// --- 14. Sort de degats (cible ennemie uniquement) ----------------------
{
  const game = newGame();
  const spell = giveHandCard(game, "chat", "sort-eclair-arcanique");
  const ally = playUnit(game, "chat", "robot-petit-automate");
  const handBefore = game.players.chat.hand.length;

  game.execute(new PlaySpellCommand(spell.instanceId, ally.instanceId));
  assert(game.players.chat.hand.length === handBefore, "une cible alliee invalide ne consomme pas le sort");
  assert(
    game.players.chat.hand.some((c) => c.instanceId === spell.instanceId),
    "le sort reste en main apres une cible refusee"
  );

  game.execute(new PlaySpellCommand(spell.instanceId, Target.hero("chien")));
  assert(game.players.chien.hp === 30 - 3, "Eclair Arcanique inflige 3 degats au heros ennemi");
}

// --- 15. Sort de pioche sans cible ---------------------------------------
{
  const game = newGame();
  const spell = giveHandCard(game, "chat", "sort-savoir-ancestral");
  const handBefore = game.players.chat.hand.length;
  game.execute(new PlaySpellCommand(spell.instanceId));
  assert(game.players.chat.hand.length === handBefore + 1, "Savoir Ancestral fait piocher 2 cartes (le sort en quitte 1, en ramene 2)");
}

// --- 16. Sort de buff qui accorde la Garde -------------------------------
{
  const game = newGame();
  const ally = playUnit(game, "chat", "noble-chambellan");
  const spell = giveHandCard(game, "chat", "sort-rang-serre");
  assert(ally.isTaunt === false, "l'unite ciblee n'a pas Garde au depart");
  game.execute(new PlaySpellCommand(spell.instanceId, ally.instanceId));
  assert(ally.isTaunt === true, "Rang Serre accorde la Garde a la cible");
  assert(ally.maxPv === 2 + 2, "Rang Serre ajoute +2 PV max a la cible");
}

// --- 17. Sort de destruction plafonne par le cout de la cible -----------
{
  const game = newGame();
  const spell = giveHandCard(game, "chat", "sort-jugement-royal");
  game.active = "chien";
  const cheap = playUnit(game, "chien", "noble-jeune-noble"); // cout 1
  const expensive = playUnit(game, "chien", "robot-gardien-botanique"); // cout 6
  game.active = "chat";

  game.execute(new PlaySpellCommand(spell.instanceId, expensive.instanceId));
  assert(game.players.chien.board.includes(expensive), "Jugement Royal refuse une cible de cout > 3");

  const spell2 = giveHandCard(game, "chat", "sort-jugement-royal");
  game.execute(new PlaySpellCommand(spell2.instanceId, cheap.instanceId));
  assert(!game.players.chien.board.includes(cheap), "Jugement Royal detruit une cible de cout <= 3");
}

// --- 18. Etourdissement : bloque une attaque puis se dissipe -----------
{
  const game = newGame();
  game.active = "chien";
  const target = playUnit(game, "chien", "noble-jeune-noble");
  game.active = "chat";
  const spell = giveHandCard(game, "chat", "sort-etourdissement");
  game.execute(new PlaySpellCommand(spell.instanceId, target.instanceId));
  assert(target.stunTurns === 1, "Etourdissement applique 1 tour d'etourdissement");

  makeAttackable(target);
  assert(target.canAttack() === false, "une unite etourdie ne peut pas attaquer meme sans mal de debarquement");

  game.execute(new EndTurnCommand()); // chat -> chien : les statuts de chien sont traites
  assert(target.stunTurns === 0, "l'etourdissement se dissipe au debut du tour du controleur");
  assert(target.canAttack() === true, "apres dissipation, l'unite peut de nouveau attaquer");
}

// --- 19. Poison Sournois : degats au debut du tour du controleur -------
{
  const game = newGame();
  game.active = "chien";
  const target = playUnit(game, "chien", "noble-jeune-noble"); // 2 PV
  game.active = "chat";
  const spell = giveHandCard(game, "chat", "sort-poison-sournois");
  game.execute(new PlaySpellCommand(spell.instanceId, target.instanceId));
  assert(target.poisonPerTurn === 2, "Poison Sournois inflige 2 degats a chaque debut de tour");

  game.execute(new EndTurnCommand()); // chat -> chien : le poison de chien se declenche
  assert(!game.players.chien.board.includes(target), "le poison detruit la cible des que ses PV tombent a 0");
}

// --- 20. Capacite maximale du plateau ------------------------------------
{
  const game = newGame();
  const player = game.players.chat;
  for (let i = 0; i < 8; i++) playAnyAffordableUnit(game, "chat");
  assert(player.board.length === 7, "le plateau n'accepte pas plus de 7 unites (BOARD_CAPACITY)");
}

// --- 21. Courbe de mana correcte pour les deux camps --------------------
{
  const game = newGame();
  assert(game.players.chat.manaCap === 1, "les Chats commencent avec 1 mana");
  game.execute(new EndTurnCommand());
  assert(game.players.chien.manaCap === 1, "les Chiens ont eux aussi 1 mana sur leur tout premier tour");
  game.execute(new EndTurnCommand());
  assert(game.players.chat.manaCap === 2, "les Chats passent a 2 mana sur leur deuxieme tour");
  game.execute(new EndTurnCommand());
  assert(game.players.chien.manaCap === 2, "les Chiens passent a 2 mana sur leur deuxieme tour");
}

// --- 22. Victoire quand les PV du heros tombent a zero ------------------
{
  const game = newGame();
  game.players.chien.hp = 3;
  const attacker = playUnit(game, "chat", "robot-automate-siege"); // 5 ATQ
  makeAttackable(attacker);
  game.execute(new AttackCommand(attacker.instanceId, Target.hero("chien")));
  assert(game.winner === "chat", "les Chats remportent la partie quand le heros adverse tombe a 0 PV ou moins");
}

console.log(`\n${passed} assertions passees.`);
