# Prototype jouable - Paw & Claw

Prototype v1 en HTML/CSS/JS, sans etape de build (modules ES natifs), avec une
identite visuelle "parchemin et or" ornementee unifiee sur tout le shell :
- le **shell meta-jeu** (accueil, collection, boutique), inspire des
  maquettes fournies ;
- le **plateau de combat** (`battle.html`), reharmonise avec le meme style
  (bandeaux joueur sombres a bordure doree, zones de plateau teintees par
  camp, mana en pastilles, bouton de fin de tour circulaire) - principes
  proches de Hearthstone (mana, plateau, points de vie de royaume) avec une
  touche de TFT (synergies de tribu), et deux camps opposes Chats contre
  Chiens qui piochent chacun dans leur propre espece.

Voir `docs/GAME_DESIGN.md` pour le detail des mecaniques.

## Lancer

Les fichiers utilisent des modules ES (`import`/`export`), qui exigent
d'etre servis en HTTP (le navigateur bloque `import` sur `file://`) :

```
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/app/  (ecran d'accueil)
```

## Ecrans du shell

```
app/
  index.html + home.css + home.js          Accueil : profil, monnaies, quete du
                                            jour (donnees de demonstration),
                                            navigation vers le reste du shell
  collection.html + collection.css/.js     Collection reelle : liste toutes les
                                            cartes de data/cards.json par tribu,
                                            avec filtres, badge de rarete,
                                            cout/ATQ/PV et espece
  shop.html + shop.css                     Maquette visuelle de la boutique
                                            (coffres, pass de combat, craft -
                                            voir GAME_DESIGN.md section 11) ;
                                            achat non fonctionnel
  soon.html + soon.css/.js                 Ecran-relais generique reutilise par
                                            toutes les sections pas encore
                                            implementees (Decks, Missions,
                                            Evenements, Guilde, Arene,
                                            Classement, Succes, Mascottes,
                                            Parametres) - titre/icone passes en
                                            parametres d'URL pour eviter de
                                            dupliquer une page par section
  battle.html + main.js + style.css + src/ + ui/
                                            Le plateau de combat jouable
                                            (voir sections suivantes)
```

Le shell n'a pas encore de backend/sauvegarde : le profil, les monnaies et la
quete du jour affiches sur l'accueil sont des donnees de demonstration
figees dans `home.js`, clairement isolees pour etre remplacees plus tard par
un vrai systeme de progression (voir `docs/GAME_DESIGN.md` sections 10-11).

## Lancer les tests

Aucune dependance a installer : le moteur est du JavaScript pur.

```
node app/src/engine.test.mjs
```

## Architecture du plateau de combat (`battle.html`)

Le code separe strictement **moteur** (logique de jeu pure, testable sans
navigateur) et **interface** (DOM), et applique plusieurs design patterns
pour rester facile a faire evoluer. Le shell meta-jeu (accueil, collection,
boutique) est volontairement plus simple : pages HTML statiques + un petit
script par ecran, sans moteur dedie tant qu'il n'y a pas de logique de jeu
a proprement parler.

```
app/
  cards-data.js         Donnees des cartes (genere depuis data/cards.json)
  main.js                Point d'entree : assemble Game + Renderer + InputController
  src/
    constants.js          Constantes partagees (PV de depart, mana, capacite de plateau, helpers d'espece)
    Game.js               Orchestrateur (etat global, delegue tout le reste)
    core/
      Card.js               Hierarchie Card -> UnitCard (espece, tribu, motscles...), SpellCard
      CardFactory.js         Factory Pattern : construit les Card depuis le JSON (champ "type")
      CardInstance.js        Un exemplaire en main/plateau (etat mutable : PV, bonus de synergie,
                              buffs de sort, mots-cles accordes, statuts etourdi/poison,
                              hasAttacked, summoningSick)
      Deck.js, Player.js    Pioche, main, plateau, mana, PV de heros
    synergy/
      TribeSynergy.js        Strategy Pattern : une tribu -> un seuil -> un bonus d'attaque a son
                              camp et, optionnellement, un malus d'attaque au camp adverse (buff+debuff)
      SynergyResolver.js      Recalcule integralement les bonus/malus des deux camps a chaque
                              changement de plateau
    effects/
      EffectStrategy.js      Interface Strategy Pattern (sorts)
      EffectContext.js        Navigation partagee (cible alliee/ennemie, degats, soin, pioche...)
      EffectRegistry.js       Associe chaque effetId de carte a sa strategie
      TargetRef.js            Represente une cible : instanceId d'unite, ou "hero:<faction>"
      <NomEffet>.js           Une classe par sort (Soin Legere, Eclair Arcanique, Savoir Ancestral,
                              Rang Serre, Jugement Royal, Etourdissement, Poison Sournois)
    victory/
      VictoryCondition.js      Interface Strategy Pattern
      HeroVictoryCondition.js  Victoire quand les PV d'un joueur tombent a 0
      VictoryChecker.js         Composite qui interroge chaque condition
    commands/
      Command.js                Interface Command Pattern
      PlayUnitCommand.js         Pose une unite (paiement du mana, plateau plein = refus)
      PlaySpellCommand.js        Joue un sort, avec ciblage optionnel
      AttackCommand.js           Attaque une unite ou frappe le heros adverse (Garde respectee)
      EndTurnCommand.js          Resout les auto-attaques puis passe au joueur suivant (mana, pioche,
                                 reinitialise les attaques)
    combat/
      AutoAttackResolver.js      Fait attaquer automatiquement, en fin de tour, toute unite qui ne
                                 l'a pas encore fait ce tour-ci (memes regles de ciblage que
                                 AttackCommand, reutilise directement)
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
- Deux camps opposes, Chats contre Chiens : chaque unite porte une espece
  et chaque joueur ne pioche que dans les unites de la sienne (les sorts
  restent neutres, disponibles pour les deux).
- Pose d'unites (main -> plateau, paiement du mana) avec mal de
  debarquement (pas d'attaque le tour ou l'unite est posee, sauf mot-cle
  Charge). L'emplacement dans la ligne se choisit en un second clic (devant
  une unite existante, ou une case vide pour la poser en bout de ligne) -
  meme principe de selection en deux temps que le ciblage de sort.
- La main de depart garantit toujours au moins une carte jouable avec le
  mana de depart (sinon echangee contre une carte abordable de la pioche),
  et cliquer une carte trop chere explique pourquoi dans le journal plutot
  que de ne rien faire silencieusement.
- Attaque manuelle et ciblee : chaque unite peut attaquer une fois par tour
  une unite ennemie de son choix (degats mutuels, vrais points de vie), ou
  frapper directement le heros adverse si aucune Garde adverse n'est en vie
  (la Garde doit toujours etre ciblee en priorite).
- Auto-attaque en fin de tour : toute unite qui n'a pas encore attaque ce
  tour-ci (et qui le peut) frappe automatiquement avant que le tour ne
  passe, avec exactement les memes regles de ciblage que l'attaque manuelle
  (Garde en priorite, sinon unite adverse, sinon le heros adverse) - aucune
  attaque possible n'est jamais perdue par oubli.
- Nombre de cartes restantes visible pour les deux camps : la pioche de
  chaque joueur (`🂠 N`) et la taille de la main adverse (dos de cartes +
  compteur) - jamais le contenu de la main adverse.
- Trois mots-cles fixes sur la carte : Garde (doit etre ciblee en
  priorite), Charge (peut attaquer des sa pose), Bouclier (absorbe
  integralement le premier coup recu).
- Deux statuts generiques, accordes temporairement par des sorts plutot que
  fixes sur la carte : Etourdissement (bloque l'attaque au prochain tour du
  controleur) et Poison (degats a chaque debut de tour du controleur tant
  que l'unite reste en jeu).
- Synergies de tribu façon TFT : Nobles et Sante octroient un bonus
  d'attaque a leur propre camp ; Robots combine un buff a son camp et un
  debuff au camp adverse, des qu'un seuil de copies est atteint sur le
  plateau (voir `docs/GAME_DESIGN.md` section 6).
- Sept sorts avec ciblage explicite ou global : Benediction Legere (soin),
  Eclair Arcanique (degats), Etourdissement, Savoir Ancestral (pioche),
  Poison Sournois, Rang Serre (buff + Garde), Jugement Royal (destruction
  conditionnelle).
- Une condition de victoire : les PV de royaume d'un joueur tombent a 0.

## Pas encore implemente

- IA (le prototype est pense pour du pass-and-play a deux humains).
- Deckbuilding (chaque camp recoit automatiquement un miroir de toutes les
  unites de sa propre espece : 2 exemplaires de chaque carte non-legendaire,
  1 exemplaire de chaque legendaire, plus tous les sorts neutres).
- Multijoueur a distance.
- Capacites textuelles propres a chaque carte au-dela des mots-cles
  generiques (le champ `capacite` existe dans le schema de donnees mais
  n'est pas encore exploite par le moteur).
- Illustrations reelles pour la plupart des cartes (seules 3 legendaires
  ont leur `art` renseigne pour l'instant ; les autres mini-cartes
  utilisent un placeholder colore par tribu — voir `docs/ASSETS.md`).
