# Liste des cartes — v0.2 (Paw & Claw)

> Source de verite : [`data/cards.json`](../data/cards.json). Ce document est une vue lisible de ce fichier ; toute modification de contenu doit se faire d'abord dans le JSON, puis regenerer `app/cards-data.js` (voir `app/README.md`). Les valeurs sont des points de depart a equilibrer en playtest, marquees **[a tester]**.
>
> Ce lot de 23 cartes est un premier echantillon representatif du catalogue "Paw & Claw" (voir `docs/GAME_DESIGN.md`), pas le catalogue final : le reste des cartes illustrees par l'equipe doit etre transcrit ici au meme format au fur et a mesure que ses statistiques sont choisies.

## Unites — Robots (6)

| Carte | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|
| Petit Automate | 1 | 1 | 3 | Commune | Garde | Petit mais increvable. |
| Sentinelle a Ressort | 2 | 2 | 3 | Commune | — | Toujours prete a bondir. |
| Golem d'Horlogerie | 3 | 2 | 5 | Rare | Garde | Chaque rouage compte. |
| Ingenieure Renarde | 4 | 4 | 4 | Rare | — | Elle repare ce que la guerre casse. |
| Automate de Siege | 5 | 5 | 6 | Epique | Garde | Un mur qui avance. |
| Gardien Botanique | 6 | 5 | 8 | Legendaire | Garde | Il prend soin du petit au grand, pour un monde plus serein. |

## Unites — Nobles (6)

| Carte | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|
| Jeune Noble | 1 | 1 | 2 | Commune | — | De grands reves pour demain. |
| Chambellan | 2 | 2 | 2 | Commune | — | L'ordre fait la grandeur. |
| Comtesse Elegante | 3 | 2 | 4 | Rare | — | La grace est une forme de pouvoir. |
| Chevalier Royal | 4 | 4 | 4 | Rare | Garde | L'honneur guide chacun de mes pas. |
| Roi Protecteur | 5 | 4 | 6 | Epique | — | Ecouter. Comprendre. Agir pour tous. |
| Souveraine Aurelia | 6 | 5 | 7 | Legendaire | Bouclier | Elle eclaire les chemins, meme dans l'ombre. |

## Unites — Sante (6)

| Carte | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|
| Infirmiere Souris | 1 | 1 | 2 | Commune | — | Toujours la premiere sur le terrain. |
| Brancardier Beagle | 2 | 1 | 4 | Commune | — | Personne n'est laisse derriere. |
| Eclaireur Convalescent | 3 | 2 | 4 | Rare | — | Gueri, mais pas oublie. |
| Mediatrice Maine Coon | 4 | 3 | 5 | Epique | — | Elle apaise les tempetes et rassemble les coeurs. |
| Sage Siamois | 5 | 3 | 6 | Epique | — | Il percoit la douleur meme dans le silence. |
| Archidruide Felin | 6 | 4 | 7 | Legendaire | Bouclier | Elle guerit au-dela des blessures, et rappelle que l'espoir existe toujours. |

## Sorts (5)

| Carte | Cout | Rarete | Cible | Effet |
|---|---|---|---|---|
| Benediction Legere | 1 | Commune | Alliee (unite ou heros) | Rend 3 PV a la cible. |
| Eclair Arcanique | 2 | Commune | Ennemie (unite ou heros) | Inflige 3 degats a la cible. |
| Savoir Ancestral | 2 | Rare | Aucune | Fait piocher 2 cartes. |
| Rang Serre | 3 | Rare | Unite alliee | Donne Garde et +2 PV a la cible. |
| Jugement Royal | 5 | Epique | Unite ennemie de cout ≤ 3 | Detruit la cible. |

## Synergies de tribu

Voir `docs/GAME_DESIGN.md` section 6 pour le detail : Nobles (+1 ATQ des 2 en jeu), Robots (+2 ATQ des 2 en jeu), Sante (+2 ATQ des 3 en jeu).

## A faire

- Deposer les illustrations reelles dans `assets/cards/<tribu>/` et renseigner le champ `art` de chaque carte (actuellement `null` partout, en attente).
- Transcrire le reste du catalogue illustre (autres cartes Nobles/Robots/Sante deja concues, et toute nouvelle tribu) avec des statistiques testees.
- Ecrire des capacites textuelles propres a certaines cartes au-dela des mots-cles generiques (le champ `capacite` existe deja dans le schema mais n'est pas encore exploite par le moteur).
- Playtester les couts/stats — tout est marque comme point de depart, pas final.
