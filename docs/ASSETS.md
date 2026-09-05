# Inventaire des assets "Paw & Claw"

> Traitement du lot d'images pousse le 05/09/2026 (38 fichiers `ChatGPT Image ...png` a la racine du repo). Ce document liste ce qui a ete trouve, comment tout a ete range/renomme, et surtout **les doublons de generation a arbitrer** avant d'aller plus loin dans l'integration.
>
> **Mise a jour** : chaque carte individuelle (Commune/Rare/Epique/Legendaire) a ete decoupee depuis les planches multi-cartes. Voir section 5.

## 1. Ce qui a ete fait

- **38 fichiers reçus, 3 doublons stricts** (memes octets) detectes et supprimes en gardant une seule copie — aucune image unique n'a ete perdue. Les 3 paires : `16_14_14`≡`23_16_58`, `20_20_59`≡`23_18_06`, `23_15_32`≡`23_19_42`.
- **35 images uniques** renommees explicitement et rangees dans `assets/` par categorie (voir section 2).
- **8 mini-illustrations decoupees automatiquement** depuis la planche de costumes cosmetiques (grille 4x2 propre, decoupe fiable) → `assets/cosmetiques/mascotte-costume-*.png`.
- **10 cartes legendaires decoupees** depuis 3 planches 2x2/2x1 dont le nom correspondait exactement a une carte deja presente dans `data/cards.json` (Robots, Nobles, Santé) :
  - `robot-gardien-botanique.png`, `robot-oracle-mecanique.png`, `robot-chevalier-astral.png`, `robot-exploratrice-stellaire.png`
  - `noble-souveraine-aurelia.png`, `noble-paladin-orion.png`, `noble-oracle-nova.png`, `noble-gardien-sylva.png`
  - `sante-archidruide-felin.png`, `sante-paladin-bienveillant.png`
- **3 illustrations reliees a `data/cards.json`** (`art` renseigne, plus besoin de placeholder colore dans l'appli) : `robot-gardien-botanique`, `noble-souveraine-aurelia`, `sante-archidruide-felin` — ce sont les 3 seules cartes de mon catalogue actuel dont le nom correspond exactement a une illustration recue. Verifie en jeu (capture d'ecran) : les 3 cartes affichent bien leur illustration en main.
- Les **~25 autres planches** (multi-cartes) sont conservees **entieres**, sans decoupe automatique, pour la raison expliquee en section 3.

## 2. Rangement

```
assets/
  reference/
    paw-claw-10-tribus-vue-ensemble.png   Planche des 10 tribus (icone + duo de personnages chacune) :
                                           Armee, Magiciens, Nobles, Ombres, Robots, Nature,
                                           Elements, Guerisseurs, Pirates, Creatures.
                                           C'est LA reference a consulter en premier.
  boosters/
    booster-royaumes-legendes-recto-verso.png   Booster generique/starter, ligne des icones des tribus
    booster-guerisseurs-vert-recto-verso.png    Booster "Guerisseurs", coloris vert fonce
    booster-guerisseurs-creme-recto-verso.png   Booster "Guerisseurs", coloris creme/or (variante)
    booster-pirates-recto-verso.png             Booster "Pirates"
    infographie-generale-boosters-contenu.png   Sachet + presentoir + "contenu d'un booster" + verso
  cosmetiques/
    mascottes-costumes-planche.png              Planche complete (8 costumes), gardee entiere
    mascotte-costume-*.png (x8)                 Chaque costume decoupe individuellement
  cards/
    dos/dos-carte-paw-and-claw.png              Nouveau verso de carte (dore/marine, patte + silhouettes)
    robots/   nobles/   sante/   ombres/   creatures/
      Cartes individuelles pretes a l'emploi (deja decoupees ou deja isolees a la generation) :
      voir liste ci-dessus + `ombre-apprenti-de-l-ombre.png`, `creature-cerbere.png`, `creature-dragon-celeste.png`
    planches/
      ombres/       2 planches d'unites (8 et 18 cartes, 2 generations differentes)
                    + 1 planche de cartes "mecaniques" (Energie/Zone/Soutien/Evenement/Objet/Compagnon)
      magiciens/    1 planche de 8 cartes
      nobles/       3 planches d'unites (8, 18 et 20 cartes - 3 generations differentes)
                    + 1 planche de 4 legendaires "variante realiste" (style different, voir section 3)
      sante/        5 planches (communes, rares, epiques x2, legendaires) - UNE SEULE generation coherente
      guerisseurs/  1 planche de 8 cartes (generation separee de "sante", meme concept)
      creatures/    9 fichiers : 2 planches "armure/magie" (gen A, gen B), 2 planches "costumes"
                    (rares + epiques, gen C) + leurs versions sans cadre, + 2 planches de variantes
                    non identifiees
      robots/       1 planche de 4 legendaires
    (dossiers chats/chiens/objets/vehicules/dos : anciens visuels "guerre de tranchees", non lies
     a Paw & Claw, conserves tels quels - voir docs/GAME_DESIGN.md section 12 sur le pivot)
```

## 3. Ce qui reste a arbitrer : plusieurs generations par tribu

Le lot recu contient **plusieurs passes de generation independantes pour la meme tribu**, avec des rosters de personnages parfois totalement differents (et parfois des noms repris mais avec un style graphique different). Je n'ai pas decoupe ni choisi a ta place : voici exactement ce qui existe pour que tu puisses trancher.

- **Nobles — 3 generations d'unites + 1 planche legendaire a part** :
  - Gen A (8 cartes, `nobles-planche-8-cartes-gen-a.png`) : Karhl le Jeune, Karhl le Loyal, Karhl le Sage, Duc Canaille, Comtesse Elegante, Chevalier Royal, Roi Karhl, Reine Bienveillante.
  - Gen B (18 cartes, `nobles-planche-18-cartes-gen-b.png`) : Page Royal, Serviteur Devoue, Messager Royal, Intendant, Comtesse Elegante, Duc Courageux, Chevalier Royal, Duchesse Raffinee, Conseiller du Roi, Princesse Heritiere, Les Trois Chats de Karhl, Roi Karhl, Reine Bienveillante, Regent Imperial, Heritier des Lumieres, Champion du Royaume, Imperatrice Eternelle, Karhl le Sage.
  - Gen C (20 cartes, `nobles-planche-20-cartes-gen-c.png`) : Jeune Noble, Ecuyer Royal, Apprentie Courtisane, Chambellan, Demoiselle d'Honneur, Heraut, Page Royal, Comtesse Elegante, Duc Courageux, Princesse Savante, Prince Bienveillant, Conseillere du Royaume, Chevalier Royal, Duchesse Raffinee, Stratege Royale, Grand Chambellan, Princesse Heritiere, Regent Imperial, Souveraine Eclairee, Roi Protecteur. **C'est cette generation dont j'ai repris "Jeune Noble", "Chambellan", "Comtesse Elegante", "Chevalier Royal" et "Roi Protecteur" pour mon catalogue actuel** (`data/cards.json`), donc c'est la plus "compatible" avec l'existant si tu dois choisir une seule generation a canoniser.
  - Legendaires "variante realiste" (`nobles-legendaires-variante-realiste.png`) : Souveraine Aurelia, Paladin Orion, Oracle Nova, Gardien Sylva - style plus mature/realiste que les 3 generations ci-dessus (qui sont "chibi"). J'ai deja decoupe et relie "Souveraine Aurelia" (correspond exactement a ma carte legendaire Nobles). Les 3 autres (Paladin Orion, Oracle Nova, Gardien Sylva) sont decoupees et disponibles mais pas encore utilisees dans `data/cards.json`.

- **Sante / Guerisseurs — meme concept, 2 generations distinctes** :
  - "Sante" (5 planches, 22 cartes au total, roster coherent sur toute la courbe 1-6) : Apprentie Soigneuse, Aide-Sanctuaire, Petite Remede, Herboriste, Soutien Devouee, Consolateur, Reconfort (communes) ; Ecu de Lumiere, Novice Sacree, Chevaliere de l'Espoir, Frappe Bienveillante, Porte-Etendard, Gardien des Ames (rares) ; Pretresse Bienveillante, Chevalier Guerisseur, Oracle des Soins, Veilleur Dalmate, Frere Saint-Bernard, Mediatrice Maine Coon, Sage Siamois (epiques) ; Archidruide Felin, Paladin Bienveillant (legendaires). **C'est cette generation dont j'ai repris "Archidruide Felin"** pour mon catalogue actuel.
  - "Guerisseurs" (1 planche, 8 cartes) : Apprentie Soigneuse, Aide-Sanctuaire, Pretresse Lumiere, Frere Protecteur, Oracle Bienveillante, Grand Guerisseur, Ange Gardien, Saint Protecteur. Nom de tribu different sur le visuel ("GUERISSEURS" vs "SANTE"), roster partiellement different malgre 2 noms de communes identiques.

- **Robots — une seule planche recue** (4 legendaires : Oracle Mecanique, Chevalier Astral, Gardien Botanique, Exploratrice Stellaire). Pas de commune/rare/epique recu pour cette tribu pour l'instant.

- **Ombres — 2 generations d'unites + 1 planche de cartes mecaniques** :
  - Gen A (8 cartes) et Gen B (18 cartes) ont des rosters differents malgre quelques noms communs (Apprenti de l'Ombre, Voleur/Espion...).
  - La planche "mecaniques" (`ombres-planche-mecaniques-sorts-objets.png`) introduit des **types de cartes qui n'existent pas dans le moteur actuel** : Energie, Energie Speciale, Carte de Zone, Soutien, Evenement, Objet, Compagnon. C'est un systeme de jeu plus riche (ressource dediee par tribu, cartes qui restent en jeu, etc.) que le modele Hearthstone simple qu'on a implemente. A garder en reference si un jour on veut enrichir les mecaniques, mais **rien n'a ete code contre ce systeme**.

- **Magiciens — une seule planche recue** (8 cartes : Apprenti Sorcier, Etudiant Curieux, Arcaniste Elementaire, Bibliothecaire, Mage des Glaces, Grand Invocateur, Archimage Celeste, Maitre des Arcanes). Tribu pas encore presente dans le moteur.

- **Creatures — la tribu la plus fournie et la plus eclatee : 3 generations** :
  - Gen A (8 cartes, style armure/magie) : Mini Drake, Chasseur d'Ecailles, Familier Lunaire, Bebe Wyvern, Griffon Divin, Esprit Kitsune, Seigneur des Ombres, Dragon Celeste.
  - Gen B (8 cartes, meme style, roster different) : Petit Explorateur, Chasseur Sauvage, Invoqueur d'Esprits, Guerrier Totemique, Harpie Celeste, Maitre des Betes, Reine des Creatures, Lien Draconique.
  - Gen C (style "costume cosplay", 2 planches + versions sans cadre + variantes de couleur) : Familier Lunaire, Bebe Wyvern, Chat Licorne, Griffon Apprenti, Requin des Mers, Cerf Enchante (rares) ; Esprit Phenix, Esprit Kitsune, Griffon Apprenti (variante violette), Chimere Obscure (epiques, avec 3 jeux de variantes de couleur/pose).
  - Cerbere et Dragon Celeste existent aussi en rendu individuel haute-resolution (`creature-cerbere.png`, `creature-dragon-celeste.png`) - Dragon Celeste reprend exactement le nom de la Gen A.
  - Deux illustrations non identifiees (`creatures-illustrations-supplementaires-non-identifiees.png`) : un chat celeste dore ailé et un chien a bois/nature - ne correspondent a aucun nom de carte vu ailleurs, a clarifier.

## 4. Recommandation

Avant d'aller plus loin (relier plus d'`art` dans `data/cards.json`, agrandir le nombre de tribus jouables), il faudrait trancher :
1. **Une seule generation par tribu** a canoniser (ex. Nobles gen C, Sante, Robots, + choisir/regenerer les manquantes pour Ombres/Magiciens/Creatures).
2. **Le nom officiel de la tribu "sante" vs "guerisseurs"** (le reste du jeu utilise "sante" en interne, mais les boosters/planche de reference disent "Guerisseurs" - a harmoniser).
3. **Si on ajoute Ombres, Magiciens et Creatures comme nouvelles tribus jouables**, avec ou sans le systeme de cartes "mecaniques" (Energie/Zone/Soutien/Evenement/Objet/Compagnon) vu sur la planche Ombres, qui demanderait un vrai travail d'extension du moteur.

## 5. Decoupe individuelle des cartes (Commune/Rare/Epique/Legendaire)

Chaque carte visible sur une planche a ete decoupee en image individuelle (nom de fichier = nom de la carte), rangee sous `assets/cards/<tribu>/` — avec un sous-dossier `gen-a/`, `gen-b/`, `gen-c/` quand plusieurs generations existent pour la meme tribu (voir section 3), pour ne jamais melanger des cartes de generations differentes qui portent parfois le meme nom.

```
assets/cards/
  ombres/
    gen-a/    7 cartes (8 - Apprenti de l'Ombre, deja isole en rendu individuel)
    gen-b/    17 cartes (18 - meme carte Apprenti de l'Ombre en double)
    mecaniques/  21 cartes "mecaniques" (Energie/Zone/Soutien/Evenement/Objet/Compagnon)
    ombre-apprenti-de-l-ombre.png   (rendu individuel haute-resolution, deja present avant cette passe)
  magiciens/     8 cartes (generation unique)
  nobles/
    gen-a/    8 cartes
    gen-b/    18 cartes
    gen-c/    20 cartes (la generation la plus proche de data/cards.json actuel)
    noble-souveraine-aurelia.png, noble-paladin-orion.png, noble-oracle-nova.png, noble-gardien-sylva.png
      (planche legendaire "variante realiste", style different des 3 generations ci-dessus)
  guerisseurs/   8 cartes (generation separee de "sante")
  sante/         22 cartes (communes+rares+epiques+legendaires, generation coherente unique)
  creatures/
    gen-a/    7 cartes (8 - Dragon Celeste, deja isole en rendu individuel)
    gen-b/    8 cartes
    gen-c/    10 cartes (6 rares + 4 epiques, style "costume")
    creature-cerbere.png, creature-dragon-celeste.png   (rendus individuels haute-resolution)
  robots/        4 cartes legendaires (aucune commune/rare/epique recue pour cette tribu)
```

**Limites connues** : quelques crops ont un tres leger rognage sur un bord (texte de citation ou icone de cout legerement coupe sur 1-2 cartes de la planche Guerisseurs et de la planche "Sante communes") - le nom, le cout, la rarete et l'illustration restent lisibles dans tous les cas. Les planches sources (`assets/cards/planches/`) restent disponibles si un recadrage plus precis est necessaire plus tard.

Les illustrations "sans cadre" (`*-sans-cadre*.png`, `*-variantes-couleur.png`) n'ont pas ete decoupees individuellement : elles ne montrent ni nom ni cout ni rarete, donc moins utiles telles quelles pour peupler `data/cards.json` en l'etat. Dispo sur demande si besoin de variantes d'illustration "libres" pour un usage hors carte (splash art, menu, etc.).

Une fois la generation canonique choisie par tribu (voir section 3), je peux relier ces illustrations aux entrees de `data/cards.json`.
