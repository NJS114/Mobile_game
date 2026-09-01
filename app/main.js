import { CARDS } from "./cards-data.js";
import { Game } from "./src/Game.js";
import { Renderer } from "./ui/Renderer.js";
import { InputController } from "./ui/InputController.js";

const dom = {
  moralChat: document.getElementById("moral-chat"),
  moralChien: document.getElementById("moral-chien"),
  prBadge: document.getElementById("pr-badge"),
  turnInfo: document.getElementById("turn-info"),
  board: document.getElementById("board"),
  handZone: document.getElementById("hand-zone"),
  log: document.getElementById("log"),
};

const passOverlay = document.getElementById("pass-overlay");
const passTitle = document.getElementById("pass-title");
const victoryOverlay = document.getElementById("victory-overlay");
const victoryText = document.getElementById("victory-text");

function factionLabel(faction) {
  return faction === "chat" ? "Chats" : "Chiens";
}

const overlays = {
  showPass(faction) {
    passTitle.textContent = `Au tour des ${factionLabel(faction)}`;
    passOverlay.classList.remove("hidden");
  },
  hidePass() {
    passOverlay.classList.add("hidden");
  },
  showVictory(winner) {
    victoryText.textContent = `Victoire des ${factionLabel(winner)} !`;
    victoryOverlay.classList.remove("hidden");
  },
};

let game;
let controller;

function startNewGame() {
  game = new Game(CARDS);
  const renderer = new Renderer(dom);
  controller = new InputController(game, renderer, document.getElementById("action-bar"), overlays);
  controller.renderAll();
  victoryOverlay.classList.add("hidden");
  overlays.showPass(game.active);
  // Expose pour le debogage manuel en console (sans impact sur le jeu normal).
  window.__debug = { game, controller };
}

document.getElementById("pass-btn").addEventListener("click", () => overlays.hidePass());
document.getElementById("restart-btn").addEventListener("click", () => startNewGame());

startNewGame();
