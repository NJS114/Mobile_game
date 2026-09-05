import { CARDS } from "./cards-data.js";
import { Game } from "./src/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { InputController } from "./ui/InputController.js";

const dom = {
  heroChat: document.getElementById("hero-chat"),
  heroChien: document.getElementById("hero-chien"),
  hpChat: document.getElementById("hp-chat"),
  hpChien: document.getElementById("hp-chien"),
  manaBadge: document.getElementById("mana-badge"),
  turnInfo: document.getElementById("turn-info"),
  enemyHand: document.getElementById("enemy-hand"),
  enemyBoard: document.getElementById("enemy-board"),
  ownBoard: document.getElementById("own-board"),
  handZone: document.getElementById("hand-zone"),
  log: document.getElementById("log"),
};

const victoryOverlay = document.getElementById("victory-overlay");
const victoryText = document.getElementById("victory-text");

function factionLabel(faction) {
  return faction === "chat" ? "Chats" : "Chiens";
}

const overlays = {
  showVictory(winner) {
    victoryText.textContent = `Victoire des ${factionLabel(winner)} !`;
    victoryOverlay.classList.remove("hidden");
  },
};

function startNewGame() {
  const game = new Game(CARDS);
  const renderer = new Renderer(dom);
  const controller = new InputController(game, renderer, document.getElementById("action-bar"), overlays);
  controller.renderAll();
  victoryOverlay.classList.add("hidden");
  // Expose pour le debogage manuel en console (sans impact sur le jeu normal).
  window.__debug = { game, controller };
}

document.getElementById("restart-btn").addEventListener("click", () => startNewGame());

startNewGame();
