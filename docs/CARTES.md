# Liste des cartes — v0.1

> Source de verite : [`data/cards.json`](../data/cards.json). Ce document est une vue lisible de ce fichier ; toute modification de contenu doit se faire d'abord dans le JSON. Les valeurs sont des points de depart a equilibrer en playtest.

## Unites — Chats (10)

| Carte | Role | Trait | Rarete | Cout | ATQ | DEF | Capacite |
|---|---|---|---|---|---|---|---|
| Tom le Flemmard | Assaut | Sol | Commune | 3 | 4 | 6 | — |
| Infirmiere Miaou | Soutien | Sol | Commune | 3 | 1 | 5 | Soigne le front depuis la tranchee (communication active) |
| Mecano Roux | Soutien | Sol | Commune | 2 | 1 | 4 | Repare un cable, ou +2 DEF a un vehicule allie |
| Canonnier Sphinx | Artillerie | Sol | Rare | 5 | 6 | 3 | Cible une carte cachee en tranchee adverse |
| Sapeur Noiraud | Sapeur | Sol | Commune | 4 | 2 | 5 | Peut creuser un tunnel |
| Operateur Radio Gris | Soutien | Sol | Commune | 3 | 1 | 4 | Repare un cable instantanement |
| Capitaine Fourrure | Commandant | Sol | Epique | 6 | 3 | 7 | +1 ATQ a la ligne (communication active) |
| Griffe Rapide | Assaut | Sol | Rare | 4 | 6 | 4 | Attaque deux fois par tour |
| Capitaine Minou | Pilote | Volant | Rare | 5 | 5 | 4 | Ignore les tranchees, frappe le front direct |
| Guetteur Tigre | Eclaireur | Sol | Commune | 2 | 2 | 3 | Revele une carte cachee adverse |

## Unites — Chiens (7)

| Carte | Role | Trait | Rarete | Cout | ATQ | DEF | Capacite |
|---|---|---|---|---|---|---|---|
| Buddy | Soutien | Sol | Commune | 2 | 1 | 3 | Deplace une carte reserve→tranchee gratuitement, ou repare un cable |
| Sergent Bouledogue | Assaut | Sol | Rare | 5 | 7 | 5 | Degats de zone sur une tranchee adverse |
| Beagle Fureteur | Eclaireur | Sol | Commune | 2 | 2 | 3 | Revele une carte cachee adverse |
| Lieutenant Husky | Pilote | Volant | Rare | 5 | 5 | 4 | Ignore les tranchees, frappe le front direct |
| Rex le Baveux | Sapeur | Sol | Rare | 4 | 3 | 8 | Peut creuser un tunnel |
| Dalmatien Transmission | Soutien | Sol | Commune | 3 | 1 | 4 | Repare un cable instantanement |
| General Berger | Commandant | Sol | Epique | 6 | 3 | 7 | +1 ATQ a la ligne (communication active) |

**Trous a combler cote chien** (pas encore d'illustration) : Medecin, Mecanicien, Fusilier de base, Artilleur.

## Objets (12)

| Carte | Faction | Cout | Rarete | Effet | Illustration |
|---|---|---|---|---|---|
| Os d'Attraction | Chat | 1 | Commune | Recule une carte chien d'une case, lui fait perdre son action | a generer |
| Pelote de Laine | Chat | 1 | Commune | Rappelle une carte chat (reserve/tranchee) + petit bouclier | a generer |
| Mine Enterree | Neutre | 2 | Commune | Degats + immobilise la 1ere carte qui avance sur la case | ✅ |
| Fumigene | Neutre | 2 | Commune | Bloque les attaques a distance sur la ligne (1 tour) | a generer |
| Caisse de Ravitaillement | Neutre | 1 | Commune | Soigne ou donne une ressource | ✅ |
| Barbeles | Neutre | 1 | Commune | Bloque le deplacement d'une carte ennemie (1 tour) | a generer |
| Radio de Campagne | Neutre | 2 | Rare | Repare une communication coupee | ✅ |
| Frappe Aerienne | Neutre | 5 | Epique | Touche le front + revele une carte cachee adverse | a generer |
| Cable de Campagne | Neutre | 2 | Rare | Repare une communication coupee (variante) | ✅ |
| Drapeau d'Objectif | Neutre | 3 | Rare | Points de victoire si controle pendant un tour | ✅ |
| Trousse de Secours | Neutre | 1 | Commune | Soigne completement une carte du front | ✅ |
| Sacs de Sable | Neutre | 1 | Commune | +2 DEF temporaire a une carte alliee | ✅ |

## Vehicules (2)

| Carte | Trait | Rarete | Cout | ATQ | DEF | Capacite |
|---|---|---|---|---|---|---|
| Bouledozer (Char) | Sol | Legendaire | 7 | 8 | 12 | Protege les allies derriere lui (-2 degats subis) |
| Le Zephyr (Avion) | Volant | Epique | 6 | 7 | 5 | Ignore les tranchees, frappe le front direct |

## A faire

- Generer les illustrations manquantes : Os d'Attraction, Pelote de Laine, Fumigene, Barbeles, Frappe Aerienne.
- Completer le roster chien (medecin, mecanicien, fusilier de base, artilleur) pour equilibrer avec les 10 cartes chat.
- Trancher la question de symetrie Os/Pelote (voir `GAME_DESIGN.md` section 8).
- Playtester les couts/stats — tout est marque comme point de depart, pas final.
