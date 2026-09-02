# Prototype jouable - Chiens vs Chats

Prototype v1 en HTML/CSS/JS, sans etape de build (modules ES natifs).
Mode passe-et-joue a deux sur le meme appareil (autour d'une "table",
comme prevu dans le GDD).

## Lancer

Les fichiers utilisent des modules ES (`import`/`export`), qui exigent
d'etre servis en HTTP (le navigateur bloque `import` sur `file://`) :

```
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/app/
```

## Lancer les tests

Aucune dependance a installer : le moteur est du JavaScript pur.

```
node app/src/engine.test.mjs
```

## Architecture

Le code separe strictement **moteur** (logique de jeu pure, testable sans
navigateur) et **interface** (DOM), et applique plusieurs design patterns
pour rester facile a faire evoluer :

```
app/
  cards-data.js         Donnees des cartes (genere depuis data/cards.json)
  main.js                Point d'entree : assemble Game + Renderer + InputController
  src/
    constants.js          Constantes partagees (tailles de zones, helpers de faction)
    Game.js               Orchestrateur (etat global, delegue tout le reste)
    core/
      Card.js               Hierarchie Card -> UnitCard -> VehicleCard, ObjectCard
      CardFactory.js         Factory Pattern : construit les Card depuis le JSON
      CardInstance.js        Un exemplaire pose sur le plateau (etat mutable : PV, boucliers, statuts, hasAttacked)
      Deck.js, Player.js, PlayerZones.js, CommunicationNetwork.js
    effects/
      EffectStrategy.js      Interface Strategy Pattern
      EffectRegistry.js      Associe chaque carte objet a sa strategie
      <NomEffet>.js           Une classe par objet de destabilisation (Os d'Attraction,
                              Pelote de Laine, Mine Enterree, Fumigene, Barbeles,
                              Radio/Cable de Campagne, Frappe Aerienne, Drapeau
                              d'Objectif, Trousse de Secours, Sacs de Sable,
                              Caisse de Ravitaillement) ; certaines exigent une
                              cible explicite via `requiresTarget()`
    combat/CombatMath.js      Calculs de degats purs (embuscade, effets a usage unique)
    victory/
      VictoryCondition.js      Interface Strategy Pattern
      <NomCondition>.js         Moral, Controle du Front via le drapeau
      VictoryChecker.js         Composite qui interroge chaque condition
    commands/
      Command.js                Interface Command Pattern
      <NomCommand>.js            Une classe par action joueur (Deployer, Avancer en
                                 tranchee, Engager au front, Creuser un tunnel,
                                 Surgir en embuscade, Attaquer une carte ou frapper
                                 le camp adverse, Jouer un objet, Finir le tour)
    events/EventEmitter.js    Observer Pattern minimal (le moteur emet, l'UI ecoute)
  ui/
    Renderer.js             Traduit l'etat du jeu en DOM (jamais l'inverse)
    InputController.js      Gere la selection en cours et traduit les clics en Command
```

**Pourquoi ces choix :**
- *Command Pattern* pour chaque action : `Game.execute(command)` reste une
  ligne, chaque action est testable isolement, et le journal de partie est
  un sous-produit naturel (chaque commande logge ce qu'elle fait).
- *Strategy Pattern* pour les objets et les conditions de victoire :
  ajouter une nouvelle carte objet ou une nouvelle regle de victoire ne
  demande qu'une nouvelle classe + une ligne d'enregistrement, jamais de
  toucher au moteur (principe ouvert/ferme).
- *CardInstance* separe de *Card* : la Card est la definition figee (les
  stats de base), l'instance porte l'etat mutable (PV restants, bouclier,
  immobilisation...). Deux exemplaires de la meme carte peuvent donc avoir
  des etats differents - indispensable des qu'un deck contient des doublons.
- *Renderer* vs *InputController* : le premier ne fait que dessiner l'etat
  du jeu, le second possede la selection en cours et decide quoi faire des
  clics. Aucun des deux ne contient de regle de jeu.

## Mecaniques implementees

- Plateau simplifie sans couloirs (Nord/Centre/Sud abandonnes) : chaque
  camp a une Reserve, une Tranchee (4 emplacements caches) et un Front
  **partage** ou les cartes se posent librement (capacite 5), plus un
  tunnel optionnel.
- Deploiement (main -> reserve), avancee reserve -> tranchee -> front.
- Communication : une seule ligne partagee, active/coupee (bloque les
  deplacements et les soutiens si coupee).
- Combat manuel et cible : chaque carte au Front peut attaquer une fois
  par tour une carte adverse au Front de son choix (degats mutuels, de
  vrais points de vie qui s'accumulent d'un tour a l'autre, un bouclier
  absorbe avant la vie reelle), ou frapper directement le moral adverse
  si son Front est vide.
- Tunnels : un sapeur peut creuser (1 par joueur), rester cache 2 tours
  maximum, et surgir en embuscade (double degats au prochain combat).
- Les objets du GDD sont simules : Os d'Attraction, Pelote de
  Laine, Mine Enterree, Fumigene, Barbeles, Radio/Cable de Campagne,
  Frappe Aerienne, Drapeau d'Objectif, Trousse de Secours, Sacs de Sable,
  Caisse de Ravitaillement. Plusieurs exigent de designer explicitement
  leur cible (Os d'Attraction, Sacs de Sable, Trousse de Secours, Caisse
  de Ravitaillement, Frappe Aerienne) faute de couloir pour l'impliquer.
- Deux conditions de victoire : moral a 0, controle cumule du Front
  pendant 3 tours une fois le Drapeau d'Objectif joue.

## Pas encore implemente

- IA (le prototype est pense pour du pass-and-play a deux humains).
- Deckbuilding (le deck de chaque camp est auto-compose de toutes ses
  unites + les objets neutres/de sa faction).
- Multijoueur a distance.
- Capacites passives des unites au-dela de leur cout/attaque/defense
  (ex. le bonus d'attaque du Commandant n'est pas encore applique
  automatiquement en combat).
