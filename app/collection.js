import { CARDS } from "./cards-data.js";

const TRIBE_LABELS = { robots: "Robots", nobles: "Nobles", sante: "Sante" };
const ESPECE_ICONS = { chat: "🐱", chien: "🐶" };

function raretyClass(rarete) {
  return `rarity-${rarete}`;
}

function buildFilterButtons(groups, onSelect) {
  const row = document.getElementById("filter-row");
  const labels = [["all", "Tout"], ...groups.map((g) => [g.key, g.label])];
  for (const [key, label] of labels) {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (key === "all" ? " active" : "");
    btn.textContent = label;
    btn.dataset.key = key;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(key);
    });
    row.appendChild(btn);
  }
}

function buildCardRow(carte) {
  const row = document.createElement("div");
  row.className = "card-row";

  const cost = document.createElement("div");
  cost.className = "cost-pip";
  cost.textContent = carte.cout;
  row.appendChild(cost);

  const thumb = document.createElement("div");
  thumb.className = `thumb${carte.tribu ? ` tribu-${carte.tribu}` : ""}`;
  if (carte.art) thumb.style.backgroundImage = `url(../${carte.art})`;
  row.appendChild(thumb);

  const info = document.createElement("div");
  info.className = "card-info";
  const nameLine = document.createElement("div");
  nameLine.className = "card-name";
  nameLine.innerHTML = `<span class="rarity-badge ${raretyClass(carte.rarete)}"></span> ${carte.nom}`;
  if (carte.espece) {
    const espece = document.createElement("span");
    espece.className = "espece-icon";
    espece.textContent = ESPECE_ICONS[carte.espece] ?? "";
    nameLine.appendChild(espece);
  }
  info.appendChild(nameLine);

  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = carte.type === "unite" ? `${TRIBE_LABELS[carte.tribu] ?? carte.tribu} - ${carte.rarete}` : `Sort - ${carte.rarete}`;
  info.appendChild(meta);
  row.appendChild(info);

  if (carte.type === "unite") {
    const stats = document.createElement("div");
    stats.className = "card-stats";
    stats.innerHTML = `<span class="atq">${carte.attaque}</span><span class="pv">${carte.pv}</span>`;
    row.appendChild(stats);
  }

  return row;
}

function render(filterKey) {
  const list = document.getElementById("card-list");
  list.innerHTML = "";

  const groups = [
    { key: "robots", label: "Robots", cartes: CARDS.cartes.filter((c) => c.tribu === "robots") },
    { key: "nobles", label: "Nobles", cartes: CARDS.cartes.filter((c) => c.tribu === "nobles") },
    { key: "sante", label: "Sante", cartes: CARDS.cartes.filter((c) => c.tribu === "sante") },
    { key: "sorts", label: "Sorts", cartes: CARDS.cartes.filter((c) => c.type === "sort") },
  ];

  for (const group of groups) {
    if (filterKey !== "all" && filterKey !== group.key) continue;
    const title = document.createElement("div");
    title.className = "tribu-group-title";
    title.textContent = `${group.label} (${group.cartes.length})`;
    list.appendChild(title);
    for (const carte of group.cartes) list.appendChild(buildCardRow(carte));
  }

  return groups;
}

const groups = render("all");
buildFilterButtons(groups, (key) => render(key));
