import { otherFaction, BOARD_CAPACITY } from "../src/constants.js";

// Responsabilite unique : transformer l'etat du jeu en DOM. Ne modifie
// jamais l'etat, ne sait pas ce qu'est une Command - elle se contente
// d'appeler les callbacks qu'on lui donne quand l'utilisateur clique.
export class Renderer {
  constructor(dom) {
    this.dom = dom;
  }

  render(game, ui, callbacks) {
    this.renderTopbar(game);
    this.renderEnemyHand(game);
    this.renderBoard(this.dom.enemyBoard, game, otherFaction(game.active), ui, callbacks);
    this.renderBoard(this.dom.ownBoard, game, game.active, ui, callbacks);
    this.renderHand(game, ui, callbacks);
    this.renderLog(game);
    this.bindHeroes(game, ui, callbacks);
  }

  renderTopbar(game) {
    this.dom.hpChat.textContent = game.players.chat.hp;
    this.dom.hpChien.textContent = game.players.chien.hp;
    this.renderManaDisplay(this.dom.manaChat, game.players.chat);
    this.renderManaDisplay(this.dom.manaChien, game.players.chien);
    this.dom.turnInfo.textContent = `Tour ${game.turn} - ${game.activeLabel}`;
  }

  renderManaDisplay(container, player) {
    container.innerHTML = "";
    const label = document.createElement("span");
    label.className = "mana-label";
    label.textContent = `⚡${player.mana}/${player.manaCap}`;
    container.appendChild(label);

    const pips = document.createElement("span");
    pips.className = "mana-pips";
    for (let i = 0; i < player.manaCap; i++) {
      const pip = document.createElement("span");
      pip.className = "mana-pip" + (i < player.mana ? " filled" : "");
      pips.appendChild(pip);
    }
    container.appendChild(pips);
  }

  renderEnemyHand(game) {
    const enemy = game.players[otherFaction(game.active)];
    this.dom.enemyHand.innerHTML = "";
    for (let i = 0; i < enemy.hand.length; i++) {
      const back = document.createElement("div");
      back.className = "hand-card hidden-card";
      this.dom.enemyHand.appendChild(back);
    }
  }

  // Affiche toujours BOARD_CAPACITY emplacements (occupes ou non) pour que
  // le plateau se lise comme une grille de cases, façon table de jeu.
  renderBoard(container, game, ownerId, ui, callbacks) {
    container.innerHTML = "";
    const board = game.players[ownerId].board;
    for (let i = 0; i < BOARD_CAPACITY; i++) {
      const instance = board[i];
      container.appendChild(
        instance ? this.buildMiniCard(instance, ownerId, ui, callbacks) : this.buildEmptySlot()
      );
    }
  }

  buildEmptySlot() {
    const div = document.createElement("div");
    div.className = "board-slot-empty";
    div.textContent = "🐾";
    return div;
  }

  buildMiniCard(instance, ownerId, ui, callbacks) {
    const div = document.createElement("div");
    div.className = `mini-card tribu-${instance.card.tribu}`;
    if (instance.card.art) div.style.backgroundImage = `url(../${instance.card.art})`;
    div.title = instance.card.nom;

    div.appendChild(this.buildKeywordRow(instance));
    div.appendChild(this.buildStatRow(instance));

    if (instance.hasAttacked || instance.summoningSick) div.classList.add("has-attacked");
    if (ui.isSelected(instance.instanceId)) div.classList.add("selected");
    if (ui.isTargetable(ownerId, instance.instanceId)) div.classList.add("targetable");

    div.addEventListener("click", () => callbacks.onBoardCardClick(ownerId, instance.instanceId));
    return div;
  }

  buildKeywordRow(instance) {
    const row = document.createElement("div");
    row.className = "keyword-row";
    if (instance.isTaunt) row.appendChild(this.buildKeywordIcon("G", "Garde"));
    if (instance.hasDivineShield) row.appendChild(this.buildKeywordIcon("B", "Bouclier"));
    if (instance.isCharge) row.appendChild(this.buildKeywordIcon("C", "Charge"));
    if (instance.stunTurns > 0) row.appendChild(this.buildKeywordIcon("E", "Etourdi"));
    if (instance.poisonPerTurn > 0) row.appendChild(this.buildKeywordIcon("P", "Empoisonne"));
    return row;
  }

  // Des lettres plutot que des emojis : leur rendu depend trop de la
  // police disponible (tofu box sur certains appareils/environnements).
  buildKeywordIcon(letter, label) {
    const span = document.createElement("span");
    span.className = `keyword-icon keyword-${label.toLowerCase()}`;
    span.title = label;
    span.textContent = letter;
    return span;
  }

  buildStatRow(instance) {
    const stats = document.createElement("div");
    stats.className = "stat-row";
    stats.innerHTML = `<span class="atq">${instance.atq}</span><span class="pv">${instance.currentPv}</span>`;
    return stats;
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
    div.className = `hand-card tribu-${instance.card.tribu ?? "sort"}` + (affordable ? "" : " unaffordable");
    if (instance.card.art) div.style.backgroundImage = `url(../${instance.card.art})`;
    div.innerHTML = `<div class="cost">${instance.card.cout}</div><div class="name">${instance.card.nom}</div>${this.buildHandCardEffectLine(instance.card)}`;
    if (ui.isSelected(instance.instanceId)) div.classList.add("selected");
    div.addEventListener("click", () => callbacks.onHandCardClick(instance.instanceId, affordable));
    return div;
  }

  // Petite ligne d'effet sous le nom (mot-cle pour une unite, capacite pour
  // un sort) - vide plutot que devinee si la carte n'en a pas.
  buildHandCardEffectLine(card) {
    const text = this.effectLineText(card);
    return text ? `<div class="effect-line">${text}</div>` : "";
  }

  effectLineText(card) {
    const keywordLabels = { garde: "Garde", charge: "Charge", bouclier: "Bouclier" };
    const keyword = card.motscles?.find((m) => keywordLabels[m]);
    if (keyword) return keywordLabels[keyword];
    return card.capacite || "";
  }

  renderLog(game) {
    this.dom.log.innerHTML = game.log
      .slice(-12)
      .map((line) => `<div>${line}</div>`)
      .join("");
    this.dom.log.scrollTop = this.dom.log.scrollHeight;
  }

  bindHeroes(game, ui, callbacks) {
    const heroElements = { chat: this.dom.heroChat, chien: this.dom.heroChien };
    for (const [faction, el] of Object.entries(heroElements)) {
      el.classList.toggle("targetable", ui.isHeroTargetable(faction));
      el.onclick = () => callbacks.onHeroClick(faction);
    }
  }
}
