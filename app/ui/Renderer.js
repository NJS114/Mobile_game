// Responsabilite unique : transformer l'etat du jeu en DOM. Ne modifie
// jamais l'etat, ne sait pas ce qu'est une Command - elle se contente
// d'appeler les callbacks qu'on lui donne quand l'utilisateur clique.
export class Renderer {
  constructor(dom) {
    this.dom = dom;
  }

  render(game, ui, callbacks) {
    this.renderTopbar(game);
    this.renderComm(game);
    this.renderSide(this.dom.enemySide, game, this.enemyFaction(game), ui, callbacks);
    this.renderSide(this.dom.ownSide, game, game.active, ui, callbacks);
    this.renderHand(game, ui, callbacks);
    this.renderLog(game);
  }

  enemyFaction(game) {
    return game.active === "chat" ? "chien" : "chat";
  }

  renderTopbar(game) {
    this.dom.moralChat.textContent = game.players.chat.moral;
    this.dom.moralChien.textContent = game.players.chien.moral;
    this.dom.prBadge.textContent = `PR ${game.activePlayer.pr}/10`;
    this.dom.turnInfo.textContent = `Tour ${game.turn} - ${game.activeFactionLabel}`;
  }

  renderComm(game) {
    const active = game.comm.isActive();
    this.dom.commBar.className = `comm-global ${active ? "comm-active" : "comm-cut"}`;
    this.dom.commBar.textContent = active ? "Communication : ACTIVE" : "Communication : COUPEE";
  }

  renderSide(container, game, faction, ui, callbacks) {
    container.innerHTML = "";
    container.className = `side ${faction === game.active ? "side-own" : "side-enemy"}`;
    container.appendChild(this.buildSideLabel(faction, game));
    container.appendChild(this.buildZoneRow("Reserve", this.buildReserveCards(game, faction, ui, callbacks)));
    container.appendChild(this.buildZoneRow("Tranchee", this.buildTrancheeCards(game, faction, ui, callbacks)));
    container.appendChild(this.buildZoneRow("Front", this.buildFrontCards(game, faction, ui, callbacks)));
    if (game.players[faction].zones.tunnel) container.appendChild(this.buildTunnelBadge(faction, game));
  }

  buildSideLabel(faction, game) {
    const label = document.createElement("div");
    label.className = `side-label ${faction}`;
    label.textContent = faction === "chat" ? "Chats" : "Chiens";
    return label;
  }

  buildZoneRow(title, cards) {
    const row = document.createElement("div");
    row.className = "zone-row";
    const label = document.createElement("div");
    label.className = "zone-row-label";
    label.textContent = title;
    row.appendChild(label);
    const cardsWrap = document.createElement("div");
    cardsWrap.className = "zone-cards";
    for (const card of cards) cardsWrap.appendChild(card);
    row.appendChild(cardsWrap);
    return row;
  }

  buildReserveCards(game, faction, ui, callbacks) {
    return game.players[faction].zones.reserve.map((instance) =>
      this.buildMiniCard(instance, false, ui, callbacks, faction, "reserve")
    );
  }

  buildTrancheeCards(game, faction, ui, callbacks) {
    return game.players[faction].zones.tranchee
      .filter((instance) => instance)
      .map((instance) => {
        const faceDown = faction !== game.active && !instance.revealed;
        return this.buildMiniCard(instance, faceDown, ui, callbacks, faction, "tranchee");
      });
  }

  buildFrontCards(game, faction, ui, callbacks) {
    return game.players[faction].zones.front.map((instance) => this.buildMiniCard(instance, false, ui, callbacks, faction, "front"));
  }

  buildTunnelBadge(faction, game) {
    const badge = document.createElement("div");
    badge.className = "tunnel-badge";
    const hidden = game.players[faction].zones.tunnelTurnsHidden;
    badge.textContent = `Tunnel occupe (${hidden}/2)`;
    return badge;
  }

  buildMiniCard(instance, faceDown, ui, callbacks, faction, zoneName) {
    const div = document.createElement("div");
    div.className = `mini-card ${faction}-owned` + (faceDown ? " hidden-card" : "");
    if (!faceDown) {
      if (instance.card.art) div.style.backgroundImage = `url(../${instance.card.art})`;
      div.title = instance.card.nom;
      const stats = document.createElement("div");
      stats.className = "stat-row";
      stats.innerHTML = `<span>${instance.attaque}</span><span>${instance.defense}</span>`;
      div.appendChild(stats);
      if (zoneName === "front" && instance.hasAttacked) div.classList.add("has-attacked");
    }
    if (ui.isSelected(instance.instanceId)) div.classList.add("selected");
    if (ui.isTargetable(faction, zoneName, instance.instanceId)) div.classList.add("targetable");
    div.addEventListener("click", () => callbacks.onCardClick(faction, zoneName, instance.instanceId));
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
