# Chiens vs Chats — Document de Design (GDD v0.1)

> Statut : premier jet consolidant le concept de plateau fourni + les mécaniques manquantes (tour de jeu, ressources, boutique, gacha). Les valeurs numériques sont des points de départ à équilibrer en playtest — elles sont marquées **[à tester]**.

## 1. Pitch

Un jeu de cartes tactique mobile en tranchées, "Chiens vs Chats" : deux factions s'affrontent sur un Front commun où les cartes se posent librement (plus de couloirs Nord/Centre/Sud, voir section 3), avec un système de tranchées cachées, de tunnels et d'une ligne de communication à couper ou réparer. Chaque faction a son identité de gameplay propre (les chats rappellent et protègent via la pelote de laine, les chiens sont perturbés par l'os d'attraction). Parties courtes (8–12 min), profondeur tactique, forte identité visuelle "cozy/goofy".

Positionnement marché : plus proche d'un **Clash Royale / Hearthstone tactique** que d'un hyper-casual pur — bonne rétention long terme, session courte, mais demande un peu plus d'apprentissage. C'est un compromis assumé entre accessibilité mass-market et profondeur stratégique.

**Direction artistique validée** : pastel cozy/goofy clair (cadres terracotta/sage, illustrations flat/thick-outline), pas une ambiance sombre façon Inscryption/Buckshot Roulette. Les assets d'ambiance sombre générés en exploration (`assets/dealer/`, `assets/cards/dos/`, `assets/decor/fond-sombre.png`, `assets/decor/lampe-suspendue.png`) sont conservés en réserve, non utilisés dans la direction actuelle — potentiellement réutilisables plus tard pour un mode/thème alternatif ou un événement spécial.

**Mise en scène du combat** : format confirmé 1v1, guerre Chats contre Chiens. Le combat se joue visuellement **autour d'une table** plutôt que sur un plateau abstrait plein ecran — les cartes sont posees sur une table de guerre entre les deux camps. Les textures de table en bois (`assets/decor/table-bois-1.png`, `table-bois-2.png`) sont neutres et reutilisables dans la direction pastel pour habiller ce fond de table.

## 2. Boucle de jeu

**Boucle de session (in-match)** : déployer → positionner (front/tranchée/tunnel) → gérer la communication → combattre → sécuriser un objectif → victoire/défaite.

**Boucle méta (entre les matchs)** : jouer un match → gagner croquettes/poussière/XP → ouvrir une caisse ou craft une carte → améliorer/adapter son deck → rejouer.
C'est cette boucle méta qui doit être répétitive et gratifiante — voir section 13 (Boutique & Gacha).

## 3. Plateau de jeu

**Simplification adoptée (remplace la version "3 couloirs Nord/Centre/Sud")** : plus de découpage en couloirs. Chaque camp a une seule Réserve, une seule Tranchée et un seul Front **partagé**, où les cartes sont posées librement — pas de case ni d'alignement strict entre elles. But : un plateau plus simple à lire sur mobile, sans perdre les mécaniques qui font l'identité du jeu (tranchée cachée, tunnel, communication).

| Camp chat | Tranchée chat | Communication | Front (cartes libres) | Tranchée chien | Camp chien |
|---|---|---|---|---|---|
| Réserve | 4 cartes cachées max | Une seule ligne, partagée | Jusqu'à 5 cartes par camp | 4 cartes cachées max | Réserve |

Chaque joueur possède : une Réserve, une Tranchée (4 emplacements **[à tester]**), un Front (capacité 5 **[à tester]**) et un tunnel optionnel (1 seul). La communication est désormais une seule ligne partagée par les deux camps (voir section 7).

## 4. Déroulement d'un tour

Système **tour par tour alterné** (plus lisible sur mobile qu'un temps réel, et compatible avec l'information cachée des tranchées) :

1. **Phase de ravitaillement** — le joueur actif gagne des Points de Ravitaillement (PR), sa ressource pour jouer des cartes. PR de départ : 3, +1 par tour, plafond 10 **[à tester]** (courbe façon Hearthstone/Clash Royale).
2. **Phase d'action** — avec ses PR, le joueur peut, dans n'importe quel ordre :
   - déployer une carte de sa main vers la Réserve (coût = coût de la carte) ;
   - avancer une carte Réserve → Tranchée, puis Tranchée → Front ;
   - faire creuser un tunnel par un Sapeur depuis la Tranchée ;
   - jouer un objet de déstabilisation (coût en PR, certains demandent de désigner une carte cible) ;
   - **attaquer** : chaque carte au Front peut attaquer une fois par tour une carte adverse de son choix au Front (combat mutuel, les deux cartes encaissent des dégâts), ou frapper directement le camp adverse si son Front est vide.
3. **Fin de tour** — vérification des conditions de victoire, sortie forcée d'un tunnel occupé depuis plus de 2 tours, passage au joueur suivant.

Une partie dure typiquement 10–16 tours par joueur.

## 5. Cartes — statistiques communes

Toute carte unité possède : **Faction** (Chat/Chien), **Coût** (PR), **Attaque**, **Points de vie**, **Rôle** (Assaut, Défense, Soutien, Sapeur, Éclaireur), **Rareté** (Commune, Rare, Épique, Légendaire), et un texte de capacité.

Deck : 24 cartes **[à tester]**, maximum 3 exemplaires d'une même carte (2 pour les Épiques, 1 pour les Légendaires), construit à partir de la collection du joueur.

## 6. Zones — règles détaillées

### Front
- Cartes visibles.
- Peuvent attaquer directement l'ennemi, avancer vers sa base, capturer un objectif, protéger les cartes derrière elles.

### Tranchée (4 emplacements)
- Une seule Tranchée par joueur (partagée, plus de découpage par couloir), avec 4 emplacements cachés **[à tester]**.
- Cartes placées face cachée possibles.
- Protégées des attaques normales, mais vulnérables à : attaque aérienne, artillerie, mine, effet de révélation.
- Médecins, radios et commandants peuvent soutenir le Front depuis la Tranchée **si la communication est active**.

### Tunnel (1 par joueur)
- Les Sapeurs peuvent creuser un passage sous le champ de bataille.
- Une carte en tunnel : ne peut pas être attaquée normalement, peut se déplacer vers une autre zone, peut apparaître derrière les lignes ennemies, peut déclencher une embuscade.
- Limites anti-abus : un seul tunnel par joueur (plus de tunnel par couloir) ; une carte ne peut pas rester cachée plus de **2 tours [à tester]** avant de devoir ressortir.

### Réserve
- Zone de stockage des cartes déployées mais pas encore engagées. Capacité **illimitée dans le prototype actuel** ; une limite **[à tester : 3 emplacements]** reste une piste d'équilibrage si la Réserve s'avère trop confortable en playtest.

## 7. Communication (câbles)

**Simplification adoptée** : plus de câble par couloir — une seule ligne de communication, partagée par les deux camps, avec deux états (plus d'état intermédiaire "en réparation" dans le prototype) :
- 🟢 **Actif** : buffs, soins, ordres, déplacements Réserve↔Tranchée↔Front, capacités de commandant/radio disponibles.
- 🔴 **Coupé** : plus de buffs, plus de soins vers le Front, plus de renforts, plus d'ordres depuis la Tranchée ; les unités déjà présentes peuvent quand même attaquer/défendre.

**Peut être coupé par** : saboteur, mine spéciale, bombardement, carte de brouillage radio, attaque du relais.
**Peut être réparé par** : médecin (capacité spéciale), opérateur radio, messager, sapeur, carte "câble de campagne" (Radio de campagne).

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

L'Os et la Pelote ne suppriment jamais une carte définitivement — ils la font reculer, lui font perdre son action, ou la rappellent vers une autre zone. Objectif : de la déstabilisation, pas de la frustration.

**Ciblage explicite** : sans couloirs pour désigner implicitement "la" carte concernée, plusieurs objets demandent maintenant de choisir explicitement leur cible au moment d'être joués (Os d'attraction, Sacs de sable, Trousse de secours, Caisse de ravitaillement, Frappe aérienne). Les autres agissent globalement (Mine enterrée pose un piège partagé, Fumigène et Radio de campagne agissent sur l'unique ligne de communication, Drapeau d'objectif active le suivi de contrôle du Front).

**Suggestion d'équilibrage des factions** *(à valider)* : pour une identité symétrique, on pourrait donner aux Chiens un objet miroir de la Pelote (ex. "Balle qui rebondit" : rappelle une carte chien avec un petit bonus), et aux Chats un objet miroir de l'Os que les Chiens retourneraient contre eux (ex. "Sifflet à ultrasons" : désoriente une carte chat). À trancher ensemble si tu veux garder l'asymétrie actuelle (chats = rappel/soutien, chiens = subissent la distraction) ou aller vers une symétrie plus classique de TCG compétitif.

## 9. Conditions de victoire

Victoire par objectifs (pas seulement par destruction). Avec un seul Front partagé (plus de couloirs), la condition "contrôler plusieurs fronts" n'a plus de sens et a été retirée ; il reste deux conditions, implémentées dans le prototype (`app/src/victory/`) :
- Faire tomber le moral adverse à zéro (jauge qui descend en perdant des unités/zones) ;
- Une fois le Drapeau d'objectif joué, contrôler le Front (occuper le Front pendant que le Front adverse est vide) pendant un nombre de tours cumulés **[à tester : 3 tours]**.

Une unité qui atteint la base ennemie déclenche déjà une frappe directe sur le moral adverse (voir section 4, "attaquer") plutôt qu'une condition de victoire séparée.

## 10. Exemple de tour (adapté au plateau simplifié)

1. Le joueur chat coupe la communication (ligne unique, partagée).
2. Les cartes chiens de la Tranchée ne peuvent plus renforcer le Front tant que la ligne est coupée.
3. Le joueur pose une mine enterrée sur le Front.
4. Un chien avance en Front et déclenche la mine.
5. Le joueur chat fait sortir un soldat de sa Tranchée par un tunnel.
6. Le joueur chat désigne une carte chien au Front et l'attaque (combat mutuel).
7. Le chien utilise un messager pour réparer sa communication.

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
- ~~Définir la liste initiale de cartes~~ → fait, voir `data/cards.json` et `docs/CARTES.md`.
- Maquetter la boutique et l'écran de tirage (gacha) dans le canvas de design, dans le même style visuel que les cartes déjà validées.
- ~~Décider du moteur technique~~ → HTML/CSS/JS pur (modules ES, pas de build), voir `app/` : prototype v1 jouable en pass-and-play à deux. Architecture orientée objet (Strategy/Command/Factory/Observer, voir `app/README.md`), mécaniques complètes : déploiement, tunnels avec embuscade, communication, combat ciblé (attaque manuelle carte contre carte, ou frappe directe du camp adverse) avec vrais points de vie, les objets du GDD, et 2 conditions de victoire (moral, contrôle du Front via le drapeau). Reste à faire : IA, deckbuilding, multijoueur distant, capacités passives des unités (ex. bonus du Commandant) au-delà de leurs stats de base.
