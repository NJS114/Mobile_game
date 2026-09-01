# Chiens vs Chats — Document de Design (GDD v0.1)

> Statut : premier jet consolidant le concept de plateau fourni + les mécaniques manquantes (tour de jeu, ressources, boutique, gacha). Les valeurs numériques sont des points de départ à équilibrer en playtest — elles sont marquées **[à tester]**.

## 1. Pitch

Un jeu de cartes tactique mobile en tranchées, "Chiens vs Chats" : deux factions s'affrontent sur trois couloirs (Nord / Centre / Sud), avec un système de tranchées cachées, de tunnels et de câbles de communication à couper ou réparer. Chaque faction a son identité de gameplay propre (les chats rappellent et protègent via la pelote de laine, les chiens sont perturbés par l'os d'attraction). Parties courtes (8–12 min), profondeur tactique, forte identité visuelle "cozy/goofy".

Positionnement marché : plus proche d'un **Clash Royale / Hearthstone tactique** que d'un hyper-casual pur — bonne rétention long terme, session courte, mais demande un peu plus d'apprentissage. C'est un compromis assumé entre accessibilité mass-market et profondeur stratégique.

**Direction artistique validée** : pastel cozy/goofy clair (cadres terracotta/sage, illustrations flat/thick-outline), pas une ambiance sombre façon Inscryption/Buckshot Roulette. Les assets d'ambiance sombre générés en exploration (`assets/decor/`, `assets/dealer/`, `assets/cards/dos/`) sont conservés en réserve, non utilisés dans la direction actuelle — potentiellement réutilisables plus tard pour un mode/thème alternatif ou un événement spécial.

## 2. Boucle de jeu

**Boucle de session (in-match)** : déployer → positionner (front/tranchée/tunnel) → gérer la communication → combattre → sécuriser un objectif → victoire/défaite.

**Boucle méta (entre les matchs)** : jouer un match → gagner croquettes/poussière/XP → ouvrir une caisse ou craft une carte → améliorer/adapter son deck → rejouer.
C'est cette boucle méta qui doit être répétitive et gratifiante — voir section 13 (Boutique & Gacha).

## 3. Plateau de jeu

Reprise du plateau proposé, 3 couloirs symétriques :

| Couloir | Camp chat | Tranchée chat | Communication | Front de bataille | Tranchée chien | Camp chien |
|---|---|---|---|---|---|---|
| Nord | Réserve | 2 cartes cachées | Câble Nord | Combats directs | 2 cartes cachées | Réserve |
| Centre | Réserve | 2 cartes cachées | Câble Centre | Combats directs | 2 cartes cachées | Réserve |
| Sud | Réserve | 2 cartes cachées | Câble Sud | Combats directs | 2 cartes cachées | Réserve |

Chaque joueur possède : 3 lignes de front, 3 tranchées (2 emplacements chacune), une réserve, une ligne de communication par couloir, et un tunnel optionnel par ligne (1 seul, pour garder le plateau lisible sur mobile).

## 4. Déroulement d'un tour

Système **tour par tour alterné** (plus lisible sur mobile qu'un temps réel, et compatible avec l'information cachée des tranchées) :

1. **Phase de ravitaillement** — le joueur actif gagne des Points de Ravitaillement (PR), sa ressource pour jouer des cartes. PR de départ : 3, +1 par tour, plafond 10 **[à tester]** (courbe façon Hearthstone/Clash Royale).
2. **Phase d'action** — avec ses PR et jusqu'à 3 actions **[à tester]**, le joueur peut :
   - déployer une carte de sa main vers la Réserve ou directement en Tranchée (coût = coût de la carte) ;
   - déplacer une carte Réserve → Tranchée → Front (1 action, gratuit ou 1 PR **[à tester]**) ;
   - faire creuser un tunnel par un Sapeur ;
   - jouer un objet de déstabilisation (coût en PR) ;
   - déclencher une capacité de soutien (médecin, radio, commandant) si la communication est active.
3. **Phase de combat** — chaque unité au Front engage l'unité en face (même couloir) ou attaque directement le Camp adverse si le Front adverse est vide sur ce couloir.
4. **Phase de résolution** — application des dégâts, vérification des conditions de victoire, mise à jour de l'état des câbles (coupé → clignotant → réparé selon les actions jouées).
5. Passage au joueur suivant.

Une partie dure typiquement 10–16 tours par joueur.

## 5. Cartes — statistiques communes

Toute carte unité possède : **Faction** (Chat/Chien), **Coût** (PR), **Attaque**, **Points de vie**, **Rôle** (Assaut, Défense, Soutien, Sapeur, Éclaireur), **Rareté** (Commune, Rare, Épique, Légendaire), et un texte de capacité.

Deck : 24 cartes **[à tester]**, maximum 3 exemplaires d'une même carte (2 pour les Épiques, 1 pour les Légendaires), construit à partir de la collection du joueur.

## 6. Zones — règles détaillées

### Front
- Cartes visibles.
- Peuvent attaquer directement l'ennemi, avancer vers sa base, capturer un objectif, protéger les cartes derrière elles.

### Tranchée (2 emplacements)
- Cartes placées face cachée possibles.
- Protégées des attaques normales, mais vulnérables à : attaque aérienne, artillerie, mine, effet de révélation.
- Médecins, radios et commandants peuvent soutenir le Front depuis la Tranchée **si la communication est active**.

### Tunnel (1 par ligne)
- Les Sapeurs peuvent creuser un passage sous le champ de bataille.
- Une carte en tunnel : ne peut pas être attaquée normalement, peut se déplacer vers une autre zone, peut apparaître derrière les lignes ennemies, peut déclencher une embuscade.
- Limites anti-abus : un seul tunnel par ligne ; une carte ne peut pas rester cachée plus de **2 tours [à tester]** avant de devoir ressortir.

### Réserve
- Zone de stockage des cartes déployées mais pas encore engagées ; capacité limitée **[à tester : 3 emplacements]**.

## 7. Communication (câbles)

Chaque ligne a un câble de communication, avec état visuel :
- 🟢 **Actif** : buffs, soins, ordres, déplacements Réserve↔Tranchée↔Front, capacités de commandant/radio disponibles.
- 🔴 **Coupé** : plus de buffs, plus de soins vers le Front, plus de renforts par cette ligne, plus d'ordres depuis la Tranchée ; les unités déjà présentes peuvent quand même attaquer/défendre.
- 🟡 **Clignotant** : en cours de réparation.

**Peut être coupé par** : saboteur, mine spéciale, bombardement, carte de brouillage radio, attaque du relais.
**Peut être réparé par** : médecin (capacité spéciale), opérateur radio, messager, sapeur, carte "câble de campagne".

## 8. Objets de déstabilisation

| Objet | Effet |
|---|---|
| Os d'attraction | Fait reculer une carte chien d'une case et lui fait perdre son action. |
| Pelote de laine | Rappelle une carte chat depuis la réserve ou la tranchée et lui donne un petit bouclier. |
| Mine enterrée | Inflige des dégâts et immobilise la première carte qui avance sur la case. |
| Fumigène | Empêche les attaques à distance pendant un tour. |
| Caisse de ravitaillement | Rend de la vie ou récupère une ressource. |
| Barbelés | Bloque le déplacement d'une carte pendant un tour. |
| Radio de campagne | Répare une communication coupée. |
| Frappe aérienne | Touche le front et révèle une carte cachée dans une tranchée. |
| Char blindé | Protège les cartes alliées derrière lui et avance lentement. |
| Drapeau d'objectif | Donne des points si une équipe le contrôle pendant un tour. |

L'Os et la Pelote ne suppriment jamais une carte définitivement — ils la font reculer, lui font perdre son action, ou la déplacent de ligne. Objectif : de la déstabilisation, pas de la frustration.

**Suggestion d'équilibrage des factions** *(à valider)* : pour une identité symétrique, on pourrait donner aux Chiens un objet miroir de la Pelote (ex. "Balle qui rebondit" : rappelle une carte chien avec un petit bonus), et aux Chats un objet miroir de l'Os que les Chiens retourneraient contre eux (ex. "Sifflet à ultrasons" : désoriente une carte chat). À trancher ensemble si tu veux garder l'asymétrie actuelle (chats = rappel/soutien, chiens = subissent la distraction) ou aller vers une symétrie plus classique de TCG compétitif.

## 9. Conditions de victoire

Victoire par objectifs (pas seulement par destruction) :
- Contrôler 2 fronts sur 3 pendant 2 tours consécutifs ;
- Une unité atteint la base ennemie (percée) ;
- Faire tomber le moral adverse à zéro (jauge qui descend en perdant des unités/zones) ;
- Capturer le Drapeau d'objectif pendant un nombre de tours cumulés **[à tester : 3 tours]**.

## 10. Exemple de tour (repris tel quel)

1. Le joueur chat coupe la communication du couloir Nord.
2. Les cartes chiens de la tranchée Nord ne peuvent plus renforcer leur front.
3. Le joueur pose une mine au centre.
4. Un chien avance et déclenche la mine.
5. Le joueur chat fait sortir un soldat de sa tranchée par un tunnel.
6. Le combat frontal commence.
7. Le chien utilise un messager pour réparer son câble.

## 11. Progression joueur (hors match)

- **Rangs saisonniers** à thème militaire-animalier amusant (Chaton Recrue → ... → Général 5 Étoiles).
- **Missions quotidiennes/hebdomadaires** : source principale de monnaie douce et de poussière de craft.
- **Album de collection** : toutes les cartes du jeu visibles, y compris celles pas encore débloquées (silhouette grisée) — moteur de FOMO doux et d'objectif long terme.
- **Escouades/Clans** *(V2)* : entraide (dons de cartes communes/rares), défis coopératifs, classement de clan.

## 12. Boutique & Gacha

### 12.1 Monnaies

| Monnaie | Type | Obtention | Usage |
|---|---|---|---|
| Croquettes 🦴 | Douce (gratuite) | Victoires, missions, quêtes de campagne | Caisses communes, craft, XP de carte |
| Médailles ⭐ | Dure (payante ou événementielle) | Achat réel, pass de combat, événements rares | Caisses premium, cosmétiques, skip de timers |
| Poussière de guerre ✨ | Craft | Doublons de cartes convertis automatiquement | Craft ciblé d'une carte précise manquante |

### 12.2 Caisses (gacha)

- **Caisse de Ravitaillement (Commune)** — prix en Croquettes, contenu majoritairement Commune/Rare.
- **Caisse Tactique (Rare)** — prix mixte, garantit au moins 1 carte Rare+.
- **Caisse d'État-Major (Légendaire)** — prix en Médailles ou récompense d'événement, garantit 1 Épique/Légendaire.
- **Système de pity** : compteur de tirages sans Légendaire ; garantie automatique au bout de **50 tirages [à tester]** — évite la frustration pure RNG, standard du genre.
- **Anti-doublon** : toute carte déjà possédée au niveau max se convertit en Poussière plutôt que d'être un tirage "perdu".

### 12.3 Structure de la boutique (onglets)

1. **Vitrine du jour** — 3-4 offres en rotation 24h, prix réduits, crée une raison de revenir chaque jour.
2. **Caisses de cartes** — les 3 caisses ci-dessus.
3. **Pass de Combat saisonnier** — piste gratuite + piste premium (payante), débloque cosmétiques et cartes exclusives **non plus puissantes**, juste des skins/cadres/avatars — ex. réutiliser la direction artistique déjà validée (variantes "goofy" alternatives d'une même unité, cadres de rareté animés).
4. **Boutique cosmétique** — skins de cartes, thèmes de plateau, effets visuels du câble de communication (vert/rouge/clignotant stylisés), animations spéciales de tranchée/tunnel.
5. **Pack de démarrage** — offre unique à prix cassé pour les nouveaux joueurs, non répétable, best-in-class pour la conversion J1.
6. **Craft** — dépenser la Poussière pour fabriquer directement une carte précise, sans dépendre du hasard.

### 12.4 Garde-fous anti-P2W (important pour la réputation mass-market)

- Toute carte obtenue en caisse reste **atteignable en jouant** (poussière gagnable gratuitement, juste plus lentement).
- Les cartes Légendaires sont **situationnelles/polyvalentes**, pas strictement plus fortes stat pour stat — pas de power creep pur payant.
- **Matchmaking basé sur le niveau moyen de collection du deck**, jamais sur l'argent dépensé.
- Le **cosmétique est le principal levier de monétisation** sans impact sur le gameplay (skins, cadres, effets de câble, animations de victoire).

## 13. Prochaines étapes

- Valider/ajuster les valeurs marquées **[à tester]** (PR, taille de deck, limites de tunnel, seuils de pity).
- Trancher la question de symétrie Os/Pelote (section 8).
- Définir la liste initiale de cartes (10-15 par faction) avec stats et texte de capacité pour un premier prototype jouable.
- Maquetter la boutique et l'écran de tirage (gacha) dans le canvas de design, dans le même style visuel que les cartes déjà validées.
- Décider du moteur technique (Unity/Godot/HTML5) pour le prototype jouable.
