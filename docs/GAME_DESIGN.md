# Paw & Claw — Document de Design (GDD v0.2)

> Statut : v0.2 acte le pivot complet depuis le concept initial "Chiens vs Chats, guerre de tranchees 14-18" vers **Paw & Claw**, un jeu de cartes de royaume fantasy avec des principes proches de Hearthstone (mana, plateau, heros) et une touche de TFT (synergies de tribu). L'ancien concept de tranchees/tunnels/communication est abandonne ; l'historique complet de la v0.1 reste consultable dans les commits git anterieurs a ce pivot (`git log -- docs/GAME_DESIGN.md`). Les valeurs numeriques restent des points de depart a equilibrer en playtest, marquees **[a tester]**.

## 1. Pitch

**Paw & Claw** est un jeu de cartes tactique mobile de royaume fantasy peuple de chats et de chiens anthropomorphes, organises en **tribus** (Robots, Nobles, Sante, et d'autres a venir) plutot qu'en deux camps qui s'affrontent. Deux joueurs s'affrontent avec leurs propres decks piochant dans la meme collection : chacun pose des unites sur un plateau commun, gere son mana, et cherche a faire tomber les points de vie du royaume adverse a zero. Parties courtes (8-12 min), profondeur tactique via les synergies de tribu, forte identite visuelle "fantasy cozy" (voir section 2).

Positionnement marche : **Hearthstone/Clash Royale tactique avec une touche TFT** (les synergies de tribu recompensent la coherence du deck, comme les traits d'une composition d'auto-battler) - bonne retention long terme, session courte, mais demande un peu plus d'apprentissage qu'un hyper-casual pur.

**Direction artistique validee** : illustrations fantasy semi-realistes/anime, cadres dores ornementes, banniere de rarete en haut de carte (Commune / Rare / Epique / Legendaire), icone de cout en haut a gauche, blason de tribu en bas a gauche, citation en bas de carte. Univers de royaume (chateaux, cathedrales, forets enchantees) plutot que l'ambiance de tranchees 14-18 du concept precedent. Trois tribus etablies pour l'instant :
- **Robots** — automates et gardiens mecaniques, identite plutot defensive (mot-cle Garde frequent).
- **Nobles** — cour royale (pages, chevaliers, souverains), identite plutot offensive.
- **Sante** — soigneurs et medecins de guerre, identite de soutien/resilience.

Les illustrations concept-art existantes (chats/chiens en tranchees, decors sombres façon Inscryption) restent archivees dans `assets/` mais ne sont plus la direction active. Les nouvelles illustrations "Paw & Claw" fournies par l'equipe doivent etre deposees dans `assets/cards/<tribu>/` au fur et a mesure ; en attendant, les cartes du prototype utilisent un placeholder colore par tribu (voir `app/style.css`).

## 2. Boucle de jeu

**Boucle de session (in-match)** : piocher → poser des unites (mana) → attaquer (unite contre unite, ou frappe directe du heros adverse) → activer des synergies de tribu → faire tomber les PV du royaume adverse.

**Boucle meta (entre les matchs)** : jouer un match → gagner des recompenses → ouvrir un coffre ou fabriquer une carte → ajuster son deck → rejouer. Voir section 12 (Boutique & Gacha).

## 3. Regles de base (façon Hearthstone)

- Chaque joueur commence avec **30 PV de royaume** et une reserve de mana de **1**, qui augmente de 1 par tour jusqu'a **10 [a tester]** ; le mana se recharge integralement a chaque tour (il ne se cumule pas d'un tour a l'autre).
- Chaque joueur pioche une carte au debut de son tour (sauf le tout premier tour de la partie, ou la main de depart suffit).
- Le plateau est un **unique alignement partage par camp** (pas de couloirs ni de zones cachees) : jusqu'a **7 unites [a tester]** par joueur, toutes visibles en permanence. Seules les mains sont cachees (l'adversaire voit le nombre de cartes, pas leur contenu).
- Une unite posee souffre du **mal de debarquement** : elle ne peut pas attaquer le tour ou elle est jouee, sauf si elle a le mot-cle **Charge**. A partir du tour suivant, elle peut attaquer une fois par tour.

## 4. Deroulement d'un tour

1. **Debut de tour** — le mana du joueur actif augmente d'un cran (sauf sur son tout premier tour) puis se recharge au maximum ; il pioche une carte ; ses unites deja en jeu redeviennent capables d'attaquer.
2. **Phase d'action** — dans l'ordre de son choix, le joueur actif peut :
   - poser une unite de sa main sur le plateau (cout = cout en mana de la carte, plateau limite a 7 unites) ;
   - jouer un sort de sa main (cout en mana ; certains sorts demandent de designer une cible, alliee ou ennemie selon le sort) ;
   - **attaquer** : chaque unite posee depuis au moins un tour peut attaquer une fois par tour une unite ennemie de son choix (degats mutuels), ou frapper directement le heros adverse si aucune unite adverse ayant la **Garde** n'est en vie (une Garde doit toujours etre ciblee en priorite, comme un Taunt).
3. **Fin de tour** — le tour passe au joueur suivant.

Une partie dure typiquement 8-14 tours par joueur.

## 5. Cartes — statistiques et mots-cles communs

Toute carte **unite** possede : **Tribu** (Robots / Nobles / Sante / ...), **Cout** (mana), **Attaque**, **Points de vie**, **Rarete** (Commune, Rare, Epique, Legendaire), une liste de **mots-cles**, et un texte de capacite/une citation d'ambiance.

Mots-cles implementes dans le prototype :
- **Garde** — doit etre ciblee en priorite avant que son controleur puisse etre attaque directement.
- **Charge** — peut attaquer des le tour ou elle est posee (ignore le mal de debarquement).
- **Bouclier** (bouclier divin) — absorbe integralement les degats de la premiere attaque recue, puis disparait.

Toute carte **sort** possede : **Cout**, **Rarete**, un **effet** (implemente via une strategie dediee, voir `app/README.md`), et peut exiger une cible (alliee ou ennemie selon le sort).

Deck (prototype) : sans systeme de deckbuilding pour l'instant, chaque joueur recoit automatiquement **2 exemplaires de chaque carte non-legendaire et 1 exemplaire de chaque legendaire** de la collection complete (miroir de collection). Un vrai deckbuilding (30 cartes choisies par le joueur, memes limites de copies) est prevu en V2 — voir section 14.

## 6. Synergies de tribu (façon TFT)

Chaque tribu octroie un bonus d'attaque a toutes ses unites en jeu des qu'un seuil de copies de cette tribu est atteint sur le plateau du meme joueur — comme les traits d'une composition TFT, sans plateau d'auto-battler ni de phase d'achat :

| Tribu | Seuil | Bonus | Identite |
|---|---|---|---|
| Nobles | 2 unites Nobles en jeu | +1 attaque a chaque Noble | Offensive, facile a declencher |
| Robots | 2 unites Robots en jeu | +2 attaque a chaque Robot | Gardiens qui frappent fort une fois masses |
| Sante | 3 unites Sante en jeu | +2 attaque a chaque unite Sante | Seuil plus dur, recompense un deck concentre |

Le bonus est recalcule integralement a chaque changement de plateau (unite posee ou detruite) : il n'est jamais cumule d'un recalcul a l'autre, et disparait immediatement si le nombre d'unites de la tribu repasse sous le seuil. Ajouter une nouvelle tribu ne demande qu'une ligne de configuration (voir `SynergyResolver` dans `app/README.md`), sans toucher au moteur — ouvert a l'ajout de synergies plus variees (soin, pioche, degats de zone...) en V2.

## 7. Conditions de victoire

Une seule condition pour l'instant, deliberement simple (le concept precedent avait un objectif "Drapeau"/controle de zone qui n'a plus de sens sans couloirs) :
- **Le royaume adverse tombe a 0 PV ou moins.**

D'autres conditions (fatigue en cas de pioche a vide, objectifs annexes) pourront etre ajoutees en V2 sans toucher au moteur, grace au Composite Pattern deja en place (`VictoryChecker`).

## 8. Exemple de tour

1. Le joueur actif commence son tour : son mana passe de 2 a 3 et se recharge, il pioche une carte.
2. Il pose un Chambellan (Noble, cout 2) sur le plateau ; il a deja un Jeune Noble en jeu, donc les deux gagnent +1 attaque grace a la synergie Nobles.
3. Une unite posee au tour precedent (donc plus malade du debarquement) attaque : l'adversaire n'a pas de carte Garde en jeu, elle frappe directement son heros.
4. Il joue le sort Eclair Arcanique (cout 2) en ciblant une unite ennemie, lui infligeant 3 degats.
5. Il termine son tour ; c'est au tour de l'adversaire.

## 9. Catalogue de cartes (prototype)

Le prototype embarque un premier lot representatif du catalogue "Paw & Claw" — 6 unites par tribu (une par palier de cout 1 a 6, rarete croissante) et 5 sorts — voir `data/cards.json` et `app/README.md`. Ce lot sert a valider le moteur et l'UI ; le catalogue complet illustre par l'equipe (dizaines de cartes par tribu, plusieurs legendaires par tribu) doit etre transcrit progressivement dans `data/cards.json` au fur et a mesure que ses statistiques sont choisies et testees, en suivant le meme schema de champs (`tribu`, `cout`, `attaque`, `pv`, `motscles`, `rarete`, `citation`, `art`).

## 10. Progression joueur (hors match)

- **Rangs saisonniers** a theme royaume (Ecuyer → ... → Souverain Legendaire).
- **Missions quotidiennes/hebdomadaires** : source principale de monnaie douce et d'eclats de craft.
- **Album de collection** : toutes les cartes du jeu visibles, y compris celles pas encore debloquees (silhouette grisee) — moteur de FOMO doux et d'objectif long terme.
- **Guildes** *(V2)* : entraide (dons de cartes communes/rares), defis cooperatifs, classement de guilde.

## 11. Boutique & Gacha

### 11.1 Monnaies

| Monnaie | Type | Obtention | Usage |
|---|---|---|---|
| Couronnes 👑 | Douce (gratuite) | Victoires, missions, quetes de campagne | Coffres communs, craft, XP de carte |
| Gemmes 💎 | Dure (payante ou evenementielle) | Achat reel, pass de combat, evenements rares | Coffres premium, cosmetiques, skip de timers |
| Eclats Arcanes ✨ | Craft | Doublons de cartes convertis automatiquement | Craft cible d'une carte precise manquante |

### 11.2 Coffres (gacha)

- **Coffre du Village (Commun)** — prix en Couronnes, contenu majoritairement Commune/Rare.
- **Coffre de la Guilde (Rare)** — prix mixte, garantit au moins 1 carte Rare+.
- **Coffre Royal (Legendaire)** — prix en Gemmes ou recompense d'evenement, garantit 1 Epique/Legendaire.
- **Systeme de pity** : compteur de tirages sans Legendaire ; garantie automatique au bout de **50 tirages [a tester]**.
- **Anti-doublon** : toute carte deja possedee au niveau max se convertit en Eclats plutot que d'etre un tirage "perdu".

### 11.3 Structure de la boutique (onglets)

1. **Vitrine du jour** — 3-4 offres en rotation 24h, prix reduits, cree une raison de revenir chaque jour.
2. **Coffres de cartes** — les 3 coffres ci-dessus.
3. **Pass de Combat saisonnier** — piste gratuite + piste premium (payante), debloque cosmetiques et cartes exclusives **non plus puissantes**, juste des skins/cadres/avatars.
4. **Boutique cosmetique** — skins de cartes, themes de plateau, effets visuels de mana, animations speciales de synergie de tribu.
5. **Pack de demarrage** — offre unique a prix casse pour les nouveaux joueurs, non repetable.
6. **Craft** — depenser les Eclats Arcanes pour fabriquer directement une carte precise, sans dependre du hasard.

### 11.4 Garde-fous anti-P2W

- Toute carte obtenue en coffre reste **atteignable en jouant** (eclats gagnables gratuitement, juste plus lentement).
- Les cartes Legendaires sont **situationnelles/polyvalentes**, pas strictement plus fortes stat pour stat.
- **Matchmaking base sur le niveau moyen de collection du deck**, jamais sur l'argent depense.
- Le **cosmetique est le principal levier de monetisation** sans impact sur le gameplay.

## 12. Historique du pivot

La version v0.1 de ce document decrivait un jeu de guerre de tranchees 14-18 "Chats vs Chiens" avec couloirs Nord/Centre/Sud, tranchees cachees, tunnels et cables de communication a couper/reparer. Ce concept a ete entierement remplace par Paw & Claw suite a un changement de direction artistique (voir les mockups de cartes fantasy fournis) et une demande explicite de simplifier les mecaniques vers un modele Hearthstone classique avec une touche TFT (synergies de tribu). Le code de l'ancien prototype (tranchees, tunnels, communication, drapeau d'objectif) a ete entierement retire de `app/src/` ; son historique reste consultable dans les commits git anterieurs a ce pivot.

## 13. Prochaines etapes

- Deposer les illustrations "Paw & Claw" fournies dans `assets/cards/<tribu>/` et les relier aux entrees de `data/cards.json` (`art`).
- Transcrire progressivement le reste du catalogue illustre (Nobles, Robots, Sante, futures tribus) dans `data/cards.json`, en choisissant des statistiques testees plutot qu'en devinant.
- Valider/ajuster les valeurs marquees **[a tester]** (paliers de mana, capacite de plateau, seuils de synergie, seuil de pity).
- Deckbuilding reel (le joueur choisit 30 cartes parmi sa collection, avec limites de copies) plutot que le miroir de collection automatique du prototype.
- Maquetter la boutique et l'ecran de tirage (gacha) dans le canvas de design, dans le style "Paw & Claw" (cadres dores, bannieres de rarete).
- Prototype technique : HTML/CSS/JS pur (modules ES, pas de build), voir `app/`. Architecture orientee objet (Command/Strategy/Factory/Observer/Composite, voir `app/README.md`), mecaniques completes : pose d'unites, mana, attaque ciblee avec Garde/Charge/Bouclier, 5 sorts, synergies de tribu, victoire par PV de heros. Reste a faire : IA, deckbuilding, multijoueur distant, capacites textuelles propres a chaque carte au-dela des mots-cles generiques.
