// Moteur de regles - Chiens vs Chats
// Logique pure (pas de DOM ici) pour rester testable independamment de l'interface.
// Reference : docs/GAME_DESIGN.md

const LANES = ["nord", "centre", "sud"];
const MORAL_INITIAL = 20;
const PR_INITIAL = 3;
const PR_CAP = 10;
const HAND_SIZE = 5;
const TRANCHEE_SLOTS = 2;

function findCard(id) {
  const all = [...CARDS.unites, ...CARDS.objets, ...CARDS.vehicules];
  const card = all.find((c) => c.id === id);
  if (!card) throw new Error("Carte inconnue: " + id);
  return card;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(faction) {
  const unites = CARDS.unites.filter((c) => c.faction === faction).map((c) => c.id);
  const vehicules = CARDS.vehicules.map((c) => c.id);
  return shuffle([...unites, ...unites, ...vehicules]);
}

function emptyLaneState() {
  return { reserve: [], tranchee: [null, null], front: null };
}

function createPlayerState(faction) {
  const deck = buildDeck(faction);
  const hand = deck.splice(0, HAND_SIZE);
  return {
    faction,
    pr: PR_INITIAL,
    moral: MORAL_INITIAL,
    hand,
    deck,
    defuseBuff: {}, // { [laneCardInstanceId]: bonus } - reserve pour futurs objets
    lanes: { nord: emptyLaneState(), centre: emptyLaneState(), sud: emptyLaneState() },
  };
}

function otherFaction(faction) {
  return faction === "chat" ? "chien" : "chat";
}

function createGame() {
  return {
    turn: 1,
    active: "chat",
    comm: { nord: "actif", centre: "actif", sud: "actif" },
    players: { chat: createPlayerState("chat"), chien: createPlayerState("chien") },
    log: ["La partie commence. Tour 1 - Chats."],
    winner: null,
  };
}

function pushLog(state, msg) {
  state.log.push(msg);
  if (state.log.length > 200) state.log.shift();
}

// --- Actions du joueur actif ---

function canDeploy(state, cardId) {
  const player = state.players[state.active];
  const card = findCard(cardId);
  if (!player.hand.includes(cardId)) return false;
  if (player.pr < card.cout) return false;
  return true;
}

function deploy(state, cardId, lane) {
  if (state.winner) return state;
  if (!canDeploy(state, cardId)) return state;
  const player = state.players[state.active];
  const card = findCard(cardId);
  player.pr -= card.cout;
  player.hand.splice(player.hand.indexOf(cardId), 1);
  player.lanes[lane].reserve.push(cardId);
  pushLog(state, `${player.faction === "chat" ? "Chat" : "Chien"} deploie ${card.nom} en reserve (${lane}).`);
  return state;
}

function commActive(state, lane) {
  return state.comm[lane] === "actif";
}

function moveReserveToTranchee(state, lane, cardId) {
  if (state.winner) return state;
  const player = state.players[state.active];
  if (!commActive(state, lane)) {
    pushLog(state, "Communication coupee : deplacement impossible sur cette ligne.");
    return state;
  }
  const laneState = player.lanes[lane];
  const idx = laneState.reserve.indexOf(cardId);
  if (idx === -1) return state;
  const slot = laneState.tranchee.indexOf(null);
  if (slot === -1) {
    pushLog(state, "Tranchee pleine sur cette ligne.");
    return state;
  }
  laneState.reserve.splice(idx, 1);
  laneState.tranchee[slot] = cardId;
  pushLog(state, `${player.faction === "chat" ? "Chat" : "Chien"} avance ${findCard(cardId).nom} en tranchee (${lane}).`);
  return state;
}

function moveTrancheeToFront(state, lane, cardId) {
  if (state.winner) return state;
  const player = state.players[state.active];
  if (!commActive(state, lane)) {
    pushLog(state, "Communication coupee : deplacement impossible sur cette ligne.");
    return state;
  }
  const laneState = player.lanes[lane];
  const idx = laneState.tranchee.indexOf(cardId);
  if (idx === -1) return state;
  if (laneState.front !== null) {
    pushLog(state, "Le front de cette ligne est deja occupe.");
    return state;
  }
  laneState.tranchee[idx] = null;
  laneState.front = cardId;
  pushLog(state, `${player.faction === "chat" ? "Chat" : "Chien"} engage ${findCard(cardId).nom} au front (${lane}).`);
  return state;
}

function playObject(state, cardId, lane) {
  if (state.winner) return state;
  const player = state.players[state.active];
  const card = findCard(cardId);
  if (!player.hand.includes(cardId) || player.pr < card.cout) return state;

  player.pr -= card.cout;
  player.hand.splice(player.hand.indexOf(cardId), 1);

  switch (card.id) {
    case "trousse-secours": {
      const targetId = player.lanes[lane].front;
      if (targetId) pushLog(state, `Trousse de Secours utilisee sur ${findCard(targetId).nom} (${lane}).`);
      break;
    }
    case "sacs-de-sable": {
      player.defuseBuff[lane] = (player.defuseBuff[lane] || 0) + 2;
      pushLog(state, `Sacs de Sable poses : +2 defense temporaire sur le front ${lane}.`);
      break;
    }
    case "radio-de-campagne":
    case "cable-de-campagne": {
      state.comm[lane] = "actif";
      pushLog(state, `${card.nom} repare la communication du couloir ${lane}.`);
      break;
    }
    default:
      pushLog(state, `${card.nom} joue (effet non simule dans ce prototype v0).`);
  }
  return state;
}

function cutCommunication(state, lane) {
  state.comm[lane] = "coupe";
  pushLog(state, `La communication du couloir ${lane} est coupee !`);
  return state;
}

// --- Fin de tour : combat puis passage au joueur suivant ---

function resolveCombat(state) {
  for (const lane of LANES) {
    const chat = state.players.chat.lanes[lane];
    const chien = state.players.chien.lanes[lane];
    const chatCard = chat.front ? findCard(chat.front) : null;
    const chienCard = chien.front ? findCard(chien.front) : null;
    const chatBuff = state.players.chat.defuseBuff[lane] || 0;
    const chienBuff = state.players.chien.defuseBuff[lane] || 0;

    if (chatCard && chienCard) {
      const chatDef = chatCard.defense + chatBuff;
      const chienDef = chienCard.defense + chienBuff;
      const chatSurvives = chatDef - chienCard.attaque > 0;
      const chienSurvives = chienDef - chatCard.attaque > 0;
      pushLog(state, `Combat ${lane} : ${chatCard.nom} (ATQ ${chatCard.attaque}) vs ${chienCard.nom} (ATQ ${chienCard.attaque}).`);
      if (!chatSurvives) {
        state.players.chat.lanes[lane].front = null;
        pushLog(state, `${chatCard.nom} est elimine.`);
      }
      if (!chienSurvives) {
        state.players.chien.lanes[lane].front = null;
        pushLog(state, `${chienCard.nom} est elimine.`);
      }
    } else if (chatCard && !chienCard) {
      state.players.chien.moral -= chatCard.attaque;
      pushLog(state, `${chatCard.nom} perce sur ${lane} : ${chatCard.attaque} degats au moral chien.`);
    } else if (chienCard && !chatCard) {
      state.players.chat.moral -= chienCard.attaque;
      pushLog(state, `${chienCard.nom} perce sur ${lane} : ${chienCard.attaque} degats au moral chat.`);
    }

    state.players.chat.defuseBuff[lane] = 0;
    state.players.chien.defuseBuff[lane] = 0;
  }
  return state;
}

function checkVictory(state) {
  if (state.players.chat.moral <= 0) state.winner = "chien";
  if (state.players.chien.moral <= 0) state.winner = "chat";
  return state;
}

function drawCard(state, faction) {
  const player = state.players[faction];
  if (player.hand.length < HAND_SIZE && player.deck.length > 0) {
    player.hand.push(player.deck.shift());
  }
}

function endTurn(state) {
  if (state.winner) return state;
  resolveCombat(state);
  checkVictory(state);
  if (state.winner) {
    pushLog(state, `Victoire des ${state.winner === "chat" ? "Chats" : "Chiens"} !`);
    return state;
  }

  state.active = otherFaction(state.active);
  state.turn += 1;
  const player = state.players[state.active];
  player.pr = Math.min(PR_CAP, player.pr + 1);
  drawCard(state, state.active);
  pushLog(state, `Tour ${state.turn} - ${state.active === "chat" ? "Chats" : "Chiens"} (PR: ${player.pr}).`);
  return state;
}

const Engine = {
  LANES,
  PR_CAP,
  TRANCHEE_SLOTS,
  findCard,
  createGame,
  canDeploy,
  deploy,
  moveReserveToTranchee,
  moveTrancheeToFront,
  playObject,
  cutCommunication,
  endTurn,
  otherFaction,
};

if (typeof module !== "undefined") module.exports = Engine;
