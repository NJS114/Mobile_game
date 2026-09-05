// Ecran d'accueil du shell "Paw & Claw". Pour l'instant sans backend/sauvegarde
// (voir docs/GAME_DESIGN.md section 10-11) : les valeurs de profil/monnaies/
// quete sont des donnees de demonstration figees, clairement isolees ici pour
// etre remplacees plus tard par un vrai systeme de progression.
const DEMO_PROFILE = {
  nom: "Joueur",
  niveauXpPourcent: 62,
  couronnes: 12450,
  gemmes: 1280,
  queteDesc: "Gagner 3 combats",
  queteProgres: 1,
  queteObjectif: 3,
};

function renderProfile(profile) {
  document.getElementById("player-name").textContent = profile.nom;
  document.getElementById("xp-fill").style.width = `${profile.niveauXpPourcent}%`;
  document.getElementById("currency-couronnes").textContent = profile.couronnes.toLocaleString("fr-FR");
  document.getElementById("currency-gemmes").textContent = profile.gemmes.toLocaleString("fr-FR");
}

function renderQuest(profile) {
  document.getElementById("quest-desc").textContent = profile.queteDesc;
  document.getElementById("quest-progress").textContent = `${profile.queteProgres}/${profile.queteObjectif}`;
  const pourcent = Math.min(100, (profile.queteProgres / profile.queteObjectif) * 100);
  document.getElementById("quest-fill").style.width = `${pourcent}%`;
}

document.getElementById("settings-btn").addEventListener("click", () => {
  window.location.href = "soon.html?titre=Param%C3%A8tres&icone=⚙";
});

renderProfile(DEMO_PROFILE);
renderQuest(DEMO_PROFILE);
