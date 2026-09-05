# Prototype jouable - Paw & Claw

Prototype v1 en HTML/CSS/JS, sans etape de build (modules ES natifs).
Mode passe-et-joue a deux sur le meme appareil, principes proches de
Hearthstone (mana, plateau, points de vie de royaume) avec une touche de
TFT (synergies de tribu) — voir `docs/GAME_DESIGN.md`.

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
    constants.js          Constantes partagees (PV de depart, mana, capacite de plateau, helpers de joueur)
    Game.js               Orchestrateur (etat global, delegue tout le reste)
    core/
      Card.js               Hierarchie Card -> UnitCard, SpellCard
      CardFactory.js         Factory Pattern : construit les Card depuis le JSON (champ "type")
      CardInstance.js        Un exemplaire en main/plateau (etat mutable : PV, bonus de synergie,
                              buffs de sort, mots-cles accordes, hasAttacked, summoningSick)
      Deck.js, Player.js    Pioche, main, plateau, mana, PV de heros
    synergy/
      TribeSynergy.js        Strategy Pattern : une tribu -> un seuil -> un bonus d'attaque
      SynergyResolver.js      Recalcule integralement les bonus a chaque changement de plateau
    effects/
      EffectStrategy.js      Interface Strategy Pattern (sorts)
      EffectContext.js        Navigation partagee (cible alliee/ennemie, degats, soin, pioche...)
      EffectRegistry.js       Associe chaque effetId de carte a sa strategie
      TargetRef.js            Represente une cible : instanceId d'unite, ou "hero:<idJoueur>"
      <NomEffet>.js           Une classe par sort (Soin Legere, Eclair Arcanique, Savoir Ancestral,
                              Rang Serre, Jugement Royal)
    victory/
      VictoryCondition.js      Interface Strategy Pattern
      HeroVictoryCondition.js  Victoire quand les PV d'un joueur tombent a 0
      VictoryChecker.js         Composite qui interroge chaque condition
    commands/
      Command.js                Interface Command Pattern
      PlayUnitCommand.js         Pose une unite (paiement du mana, plateau plein = refus)
      PlaySpellCommand.js        Joue un sort, avec ciblage optionnel
      AttackCommand.js           Attaque une unite ou frappe le heros adverse (Garde respectee)
      EndTurnCommand.js          Passe au joueur suivant (mana, pioche, reinitialise les attaques)
    events/EventEmitter.js    Observer Pattern minimal (le moteur emet, l'UI ecoute)
  ui/
    Renderer.js             Traduit l'etat du jeu en DOM (jamais l'inverse)
    InputController.js      Gere la selection en cours et traduit les clics en Command
```

**Pourquoi ces choix :**
- *Command Pattern* pour chaque action : `Game.execute(command)` reste une
  ligne, chaque action est testable isolement, et le journal de partie est
  un sous-produit naturel (chaque commande logge ce qu'elle fait).
- *Strategy Pattern* pour les sorts, les conditions de victoire et les
  synergies de tribu : ajouter une nouvelle carte, une nouvelle regle de
  victoire ou une nouvelle tribu ne demande qu'une nouvelle classe (ou une
  ligne de configuration) + un enregistrement, jamais de toucher au moteur
  (principe ouvert/ferme).
- *CardInstance* separe de *Card* : la Card est la definition figee (les
  stats de base), l'instance porte l'etat mutable (PV restants, bonus de
  synergie, buffs de sort, mots-cles accordes en jeu...). Deux exemplaires
  de la meme carte peuvent donc avoir des etats differents - indispensable
  des qu'un deck contient des doublons.
- *SynergyResolver* recalcule toujours depuis zero (reset puis reapplique)
  a chaque changement de plateau plutot que d'incrementer des compteurs :
  reste correct quel que soit le nombre d'appels, et gere naturellement la
  disparition d'un bonus quand une unite de la tribu meurt.
- *Renderer* vs *InputController* : le premier ne fait que dessiner l'etat
  du jeu, le second possede la selection en cours et decide quoi faire des
  clics. Aucun des deux ne contient de regle de jeu.

## Mecaniques implementees

- Plateau simple façon Hearthstone : chaque joueur a une main, un plateau
  unique (jusqu'a 7 unites), 30 PV de royaume, un mana qui augmente de 1
  par tour (plafond 10) et se recharge integralement a chaque tour.
- Pose d'unites (main -> plateau, paiement du mana) avec mal de
  debarquement (pas d'attaque le tour ou l'unite est posee, sauf mot-cle
  Charge).
- Attaque manuelle et ciblee : chaque unite peut attaquer une fois par tour
  une unite ennemie de son choix (degats mutuels, vrais points de vie), ou
  frapper directement le heros adverse si aucune Garde adverse n'est en vie
  (la Garde doit toujours etre ciblee en priorite).
- Trois mots-cles : Garde (doit etre ciblee en priorite), Charge (peut
  attaquer des sa pose), Bouclier (absorbe integralement le premier coup
  recu).
- Synergies de tribu façon TFT : Nobles, Robots et Sante octroient chacune
  un bonus d'attaque a leurs unites des qu'un seuil de copies est atteint
  sur le plateau (voir `docs/GAME_DESIGN.md` section 6).
- Cinq sorts avec ciblage explicite ou global : Benediction Legere (soin),
  Eclair Arcanique (degats), Savoir Ancestral (pioche), Rang Serre (buff +
  Garde), Jugement Royal (destruction conditionnelle).
- Une condition de victoire : les PV de royaume d'un joueur tombent a 0.

## Pas encore implemente

- IA (le prototype est pense pour du pass-and-play a deux humains).
- Deckbuilding (chaque camp recoit automatiquement un miroir de toute la
  collection : 2 exemplaires de chaque carte non-legendaire, 1 exemplaire
  de chaque legendaire).
- Multijoueur a distance.
- Capacites textuelles propres a chaque carte au-dela des mots-cles
  generiques (le champ `capacite` existe dans le schema de donnees mais
  n'est pas encore exploite par le moteur).
- Illustrations reelles des cartes (le champ `art` est `null` partout ;
  les mini-cartes utilisent un placeholder colore par tribu en attendant
  que les assets soient deposes dans `assets/cards/<tribu>/`).
