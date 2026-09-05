// Ecran-relais generique pour toutes les sections pas encore implementees
// (Decks, Missions, Evenements, Guilde, Arene, Classement, Succes,
// Mascottes, Parametres...), pour eviter de dupliquer une page quasi
// identique par section. Le titre/icone viennent de l'URL (voir index.html).
const params = new URLSearchParams(window.location.search);
const titre = params.get("titre") ?? "Bientot disponible";
const icone = params.get("icone") ?? "🚧";

// textContent plutot que innerHTML : les parametres viennent de l'URL,
// jamais interpretes comme du HTML meme si quelqu'un les modifie a la main.
document.title = `${titre} - Paw & Claw`;
document.getElementById("screen-title").textContent = titre;
document.getElementById("soon-icon").textContent = icone;
