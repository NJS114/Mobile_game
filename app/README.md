# Prototype jouable - Chiens vs Chats

Prototype v0.1 en HTML/CSS/JS pur, sans etape de build. Mode passe-et-joue
a deux sur le meme appareil (autour d'une "table", comme prevu dans le GDD).

## Lancer

Ouvrir `app/index.html` directement dans un navigateur, ou servir le dossier
racine du depot avec un serveur statique (necessaire si le navigateur bloque
les requetes `file://`) :

```
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/app/
```

## Structure

- `cards-data.js` - genere depuis `data/cards.json` (voir le script de
  conversion utilise lors de sa creation ; regenerer si le JSON change).
- `engine.js` - logique de jeu pure (deploiement, deplacement entre zones,
  communication, combat, victoire). Sans dependance au DOM, testable seule.
- `engine.test.js` - quelques verifications de base : `node app/engine.test.js`.
- `game.js` - relie le moteur au DOM (rendu du plateau, de la main, gestion
  des clics).
- `style.css` / `index.html` - interface, reprend la palette pastel du
  canvas de design.

## Ce qui est simule dans ce v0.1

- Deploiement en reserve, avancee reserve -> tranchee -> front.
- Communication active/coupee (bloque les deplacements si coupee).
- Combat au front (mutuel si les deux camps sont engages, percee directe sur
  le moral sinon).
- 3 objets simules : Trousse de Secours, Sacs de Sable, Radio/Cable de
  Campagne (reparation de communication).
- Victoire par moral a 0.

## Pas encore implemente (voir docs/GAME_DESIGN.md)

- Tunnels et embuscades.
- Les autres objets (Os d'Attraction, Pelote de Laine, Mine, Barbeles,
  Fumigene, Frappe Aerienne, Drapeau d'Objectif).
- Conditions de victoire par controle de front / drapeau.
- IA (le prototype est pense pour du pass-and-play a deux humains).
- Deckbuilding (le deck de chaque camp est auto-compose de toutes ses unites).
