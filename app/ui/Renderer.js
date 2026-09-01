import { LANES } from "../src/constants.js";

// Responsabilite unique : transformer l'etat du jeu en DOM. Ne modifie
// jamais l'etat, ne sait pas ce qu'est une Command - elle se contente
// d'appeler les callbacks qu'on lui donne quand l'utilisateur clique.
export class Renderer {
  constructor(dom) {
    this.dom = dom;
  }

  render(game, ui, callbacks) {
    this.renderTopbar(game);
    this.renderBoard(game, ui, callbacks);
    this.renderHand(game, ui, callbacks);
    this.renderLog(game);
  }

  renderTopbar(game) {
    this.dom.moralChat.textContent = game.players.chat.moral;
    this.dom.moralChien.textContent = game.players.chien.moral;
    this.dom.prBadge.textContent = `PR ${game.activePlayer.pr}/10`;
    this.dom.turnInfo.textContent = `Tour ${game.turn} - ${game.activeFactionLabel}`;
  }

  renderBoard(game, ui, callbacks) {
    this.dom.board.innerHTML = "";
    this.dom.board.appendChild(this.buildLaneHeader());
    for (const lane of LANES) {
      this.dom.board.appendChild(this.buildLaneRow(game, lane, ui, callbacks));
    }
  }

  buildLaneHeader() {
    const header = document.createElement("div");
    header.className = "lane-header";
    header.innerHTML = "<span></span><span>Reserve</span><span>Tranchee</span><span>Comm.</span><span>Front</span><span>Tranchee</span><span>Reserve</span>";
    return header;
  }

  buildLaneRow(game, lane, ui, callbacks) {
    const row = document.createElement("div");
    row.className = "lane";
    row.appendChild(this.buildLaneLabel(lane));
    row.appendChild(this.buildReserveZone(game, "chat", lane, ui, callbacks));
    row.appendChild(this.buildTrancheeZone(game, "chat", lane, ui, callbacks));
    row.appendChild(this.buildCommZone(game, lane));
    row.appendChild(this.buildFrontZone(game, lane, ui, callbacks));
    row.appendChild(this.buildTrancheeZone(game, "chien", lane, ui, callbacks));
    row.appendChild(this.buildReserveZone(game, "chien", lane, ui, callbacks));
    return row;
  }

  buildLaneLabel(lane) {
    const label = document.createElement("div");
    label.className = "lane-label";
    label.textContent = lane.toUpperCase();
    return label;
  }

  buildReserveZone(game, faction, lane, ui, callbacks) {
    const zone = this.zoneWithLabel("RES");
    for (const instance of game.players[faction].lanes[lane].reserve) {
      zone.appendChild(this.buildMiniCard(instance, false, ui, callbacks, faction, lane, "reserve"));
    }
    return zone;
  }

  buildTrancheeZone(game, faction, lane, ui, callbacks) {
    const zone = this.zoneWithLabel("TRA");
    for (const instance of game.players[faction].lanes[lane].tranchee) {
      if (!instance) continue;
      const faceDown = faction !== game.active && !instance.revealed;
      zone.appendChild(this.buildMiniCard(instance, faceDown, ui, callbacks, faction, lane, "tranchee"));
    }
    return zone;
  }

  buildFrontZone(game, lane, ui, callbacks) {
    const zone = this.zoneWithLabel("FRONT");
    const chatCard = game.players.chat.lanes[lane].front;
    const chienCard = game.players.chien.lanes[lane].front;
    if (chatCard) zone.appendChild(this.buildMiniCard(chatCard, false, ui, callbacks, "chat", lane, "front"));
    if (chienCard) zone.appendChild(this.buildMiniCard(chienCard, false, ui, callbacks, "chien", lane, "front"));
    return zone;
  }

  buildCommZone(game, lane) {
    const state = game.comm.status[lane];
    const div = document.createElement("div");
    div.className = `comm comm-${state}`;
    div.innerHTML = `<div class="comm-bar"></div><div class="comm-txt">${state === "actif" ? "OK" : "COUPE"}</div>`;
    return div;
  }

  zoneWithLabel(text) {
    const zone = document.createElement("div");
    zone.className = "zone";
    const label = document.createElement("div");
    label.className = "zone-label";
    label.textContent = text;
    zone.appendChild(label);
    return zone;
  }

  buildMiniCard(instance, faceDown, ui, callbacks, faction, lane, zoneName) {
    const div = document.createElement("div");
    div.className = `mini-card ${faction}-owned` + (faceDown ? " hidden-card" : "");
    if (!faceDown) {
      if (instance.card.art) div.style.backgroundImage = `url(../${instance.card.art})`;
      div.title = instance.card.nom;
      const stats = document.createElement("div");
      stats.className = "stat-row";
      stats.innerHTML = `<span>${instance.attaque}</span><span>${instance.defense}</span>`;
      div.appendChild(stats);
    }
    if (ui.isSelected(instance.instanceId)) div.classList.add("selected");
    div.addEventListener("click", () => callbacks.onCardClick(faction, zoneName, lane, instance.instanceId));
    return div;
  }

  renderHand(game, ui, callbacks) {
    this.dom.handZone.innerHTML = "";
    const player = game.activePlayer;
    for (const instance of player.hand) {
      this.dom.handZone.appendChild(this.buildHandCard(instance, player, ui, callbacks));
    }
  }

  buildHandCard(instance, player, ui, callbacks) {
    const affordable = player.canAfford(instance.card);
    const div = document.createElement("div");
    div.className = "hand-card" + (affordable ? "" : " unaffordable");
    if (instance.card.art) div.style.backgroundImage = `url(../${instance.card.art})`;
    div.innerHTML = `<div class="cost">${instance.card.cout}</div><div class="name">${instance.card.nom}</div>`;
    if (ui.isSelected(instance.instanceId)) div.classList.add("selected");
    div.addEventListener("click", () => callbacks.onHandCardClick(instance.instanceId, affordable));
    return div;
  }

  renderLog(game) {
    this.dom.log.innerHTML = game.log
      .slice(-12)
      .map((line) => `<div>${line}</div>`)
      .join("");
    this.dom.log.scrollTop = this.dom.log.scrollHeight;
  }
}
