// Interface du prototype - relie le moteur (engine.js) au DOM.
// Mode "passe-et-joue" a deux sur le meme appareil, autour d'une table.

let game = Engine.createGame();
let selected = null; // { kind: 'hand'|'reserve'|'tranchee', cardId, lane }

const el = (id) => document.getElementById(id);

function factionLabel(f) {
  return f === "chat" ? "Chats" : "Chiens";
}

function cardArt(cardId) {
  const card = Engine.findCard(cardId);
  // Les chemins dans data/cards.json sont relatifs a la racine du depot ;
  // cette page vit dans app/, d'ou le prefixe "../".
  return card.art ? "../" + card.art : null;
}

function renderPassOverlay() {
  const overlay = el("pass-overlay");
  overlay.classList.remove("hidden");
  el("pass-title").textContent = `Au tour des ${factionLabel(game.active)}`;
  el("pass-btn").className = game.active === "chat" ? "" : "";
}

function hideOverlays() {
  el("pass-overlay").classList.add("hidden");
}

function renderTopbar() {
  el("moral-chat").textContent = game.players.chat.moral;
  el("moral-chien").textContent = game.players.chien.moral;
  el("pr-badge").textContent = `PR ${game.players[game.active].pr}/${Engine.PR_CAP}`;
  el("turn-info").textContent = `Tour ${game.turn} - ${factionLabel(game.active)}`;
}

function makeMiniCard(cardId, owner, faceDown) {
  const div = document.createElement("div");
  div.className = `mini-card ${owner}-owned` + (faceDown ? " hidden-card" : "");
  if (!faceDown) {
    const art = cardArt(cardId);
    if (art) div.style.backgroundImage = `url(${art})`;
    const card = Engine.findCard(cardId);
    const stats = document.createElement("div");
    stats.className = "stat-row";
    stats.innerHTML = `<span>${card.attaque}</span><span>${card.defense}</span>`;
    div.appendChild(stats);
    div.title = card.nom;
  } else {
    div.title = "Carte cachee";
  }
  return div;
}

function renderZoneReserve(faction, lane) {
  const zone = document.createElement("div");
  zone.className = "zone reserve";
  const label = document.createElement("div");
  label.className = "zone-label";
  label.textContent = "RES";
  zone.appendChild(label);
  const isOwn = faction === game.active;
  game.players[faction].lanes[lane].reserve.forEach((cardId) => {
    const mc = makeMiniCard(cardId, faction, false);
    if (isOwn) {
      mc.addEventListener("click", () => onSelectReserve(lane, cardId));
      if (selected && selected.kind === "reserve" && selected.cardId === cardId) mc.classList.add("selected");
    }
    zone.appendChild(mc);
  });
  if (isOwn && selected && selected.kind === "reserve") zone.classList.remove("selectable");
  return zone;
}

function renderZoneTranchee(faction, lane) {
  const zone = document.createElement("div");
  zone.className = "zone tranchee";
  const label = document.createElement("div");
  label.className = "zone-label";
  label.textContent = "TRA";
  zone.appendChild(label);
  const isOwn = faction === game.active;
  game.players[faction].lanes[lane].tranchee.forEach((cardId) => {
    if (!cardId) return;
    const faceDown = !isOwn; // face cachee pour l'ecran visible tant que ce n'est pas le proprietaire (simulation d'info cachee en pass-and-play)
    const mc = makeMiniCard(cardId, faction, faceDown);
    if (isOwn) {
      mc.addEventListener("click", () => onSelectTranchee(lane, cardId));
      if (selected && selected.kind === "tranchee" && selected.cardId === cardId) mc.classList.add("selected");
    }
    zone.appendChild(mc);
  });
  return zone;
}

function renderZoneFront(lane) {
  const zone = document.createElement("div");
  zone.className = "zone front";
  const label = document.createElement("div");
  label.className = "zone-label";
  label.textContent = "FRONT";
  zone.appendChild(label);
  const chatId = game.players.chat.lanes[lane].front;
  const chienId = game.players.chien.lanes[lane].front;
  if (chatId) zone.appendChild(makeMiniCard(chatId, "chat", false));
  if (chienId) zone.appendChild(makeMiniCard(chienId, "chien", false));
  return zone;
}

function renderComm(lane) {
  const div = document.createElement("div");
  const state = game.comm[lane];
  div.className = `comm comm-${state}`;
  const bar = document.createElement("div");
  bar.className = "comm-bar";
  div.appendChild(bar);
  const txt = document.createElement("div");
  txt.className = "comm-txt";
  txt.textContent = state === "actif" ? "OK" : "COUPE";
  div.appendChild(txt);
  return div;
}

function renderBoard() {
  const board = el("board");
  board.innerHTML = "";

  const header = document.createElement("div");
  header.className = "lane-header";
  header.innerHTML = `<span></span><span>Reserve</span><span>Tranchee</span><span>Comm.</span><span>Front</span><span>Tranchee</span><span>Reserve</span>`;
  board.appendChild(header);

  Engine.LANES.forEach((lane) => {
    const row = document.createElement("div");
    row.className = "lane";

    const label = document.createElement("div");
    label.className = "lane-label";
    label.textContent = lane.toUpperCase();
    row.appendChild(label);

    row.appendChild(renderZoneReserve("chat", lane));
    row.appendChild(renderZoneTranchee("chat", lane));

    const comm = renderComm(lane);
    comm.addEventListener("click", () => onToggleObjectTargetLane(lane));
    row.appendChild(comm);

    row.appendChild(renderZoneFront(lane));
    row.appendChild(renderZoneTranchee("chien", lane));
    row.appendChild(renderZoneReserve("chien", lane));

    board.appendChild(row);
  });
}

function renderHand() {
  const handZone = el("hand-zone");
  handZone.innerHTML = "";
  const player = game.players[game.active];
  player.hand.forEach((cardId) => {
    const card = Engine.findCard(cardId);
    const div = document.createElement("div");
    const affordable = player.pr >= card.cout;
    div.className = "hand-card" + (affordable ? "" : " unaffordable");
    const art = cardArt(cardId);
    if (art) div.style.backgroundImage = `url(${art})`;
    div.innerHTML = `<div class="cost">${card.cout}</div><div class="name">${card.nom}</div>`;
    if (selected && selected.kind === "hand" && selected.cardId === cardId) div.classList.add("selected");
    div.addEventListener("click", () => onSelectHand(cardId, affordable));
    handZone.appendChild(div);
  });
}

function renderLog() {
  const logEl = el("log");
  logEl.innerHTML = game.log.slice(-12).map((l) => `<div>${l}</div>`).join("");
  logEl.scrollTop = logEl.scrollHeight;
}

function renderActionBar() {
  const bar = el("action-bar");
  bar.innerHTML = "";

  const hint = document.createElement("span");
  if (selected) {
    const card = Engine.findCard(selected.cardId);
    hint.textContent =
      selected.kind === "hand"
        ? `${card.nom} selectionnee - choisis une ligne pour la deployer en reserve.`
        : selected.kind === "reserve"
        ? `${card.nom} en reserve - choisis une ligne pour l'avancer en tranchee.`
        : `${card.nom} en tranchee - choisis une ligne pour l'engager au front.`;
  } else {
    hint.textContent = "Selectionne une carte en main, en reserve ou en tranchee.";
  }
  hint.style.display = "block";
  hint.style.fontSize = "11px";
  hint.style.color = "#8A6B4A";
  hint.style.width = "100%";
  hint.style.textAlign = "center";
  bar.appendChild(hint);

  if (selected) {
    Engine.LANES.forEach((lane) => {
      const btn = document.createElement("button");
      btn.textContent = lane.toUpperCase();
      btn.className = "primary";
      btn.addEventListener("click", () => onConfirmLane(lane));
      bar.appendChild(btn);
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Annuler";
    cancel.addEventListener("click", () => {
      selected = null;
      renderAll();
    });
    bar.appendChild(cancel);
  }

  const endBtn = document.createElement("button");
  endBtn.textContent = "Fin du tour";
  endBtn.addEventListener("click", onEndTurn);
  bar.appendChild(endBtn);
}

function onSelectHand(cardId, affordable) {
  if (!affordable) return;
  selected = selected && selected.kind === "hand" && selected.cardId === cardId ? null : { kind: "hand", cardId };
  renderAll();
}

function onSelectReserve(lane, cardId) {
  selected = selected && selected.kind === "reserve" && selected.cardId === cardId ? null : { kind: "reserve", cardId, lane };
  renderAll();
}

function onSelectTranchee(lane, cardId) {
  selected = selected && selected.kind === "tranchee" && selected.cardId === cardId ? null : { kind: "tranchee", cardId, lane };
  renderAll();
}

function onToggleObjectTargetLane() {
  // Reserve pour une future interaction "jouer un objet sur cette ligne".
}

function onConfirmLane(lane) {
  if (!selected) return;
  const card = Engine.findCard(selected.cardId);
  if (selected.kind === "hand") {
    if (card.effet !== undefined) {
      Engine.playObject(game, selected.cardId, lane);
    } else {
      Engine.deploy(game, selected.cardId, lane);
    }
  } else if (selected.kind === "reserve") {
    Engine.moveReserveToTranchee(game, lane, selected.cardId);
  } else if (selected.kind === "tranchee") {
    Engine.moveTrancheeToFront(game, lane, selected.cardId);
  }
  selected = null;
  renderAll();
}

function onEndTurn() {
  selected = null;
  Engine.endTurn(game);
  renderAll();
  if (game.winner) {
    el("victory-overlay").classList.remove("hidden");
    el("victory-text").textContent = `Victoire des ${factionLabel(game.winner)} !`;
  } else {
    renderPassOverlay();
  }
}

function renderAll() {
  renderTopbar();
  renderBoard();
  renderHand();
  renderActionBar();
  renderLog();
}

el("pass-btn").addEventListener("click", () => {
  hideOverlays();
});

el("restart-btn").addEventListener("click", () => {
  game = Engine.createGame();
  selected = null;
  el("victory-overlay").classList.add("hidden");
  renderAll();
  renderPassOverlay();
});

renderAll();
renderPassOverlay();
