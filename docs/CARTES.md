# Liste des cartes — v0.3 (Paw & Claw)

> Source de verite : [`data/cards.json`](../data/cards.json). Ce document est une vue lisible de ce fichier ; toute modification de contenu doit se faire d'abord dans le JSON, puis regenerer `app/cards-data.js` (voir `app/README.md`). Les valeurs sont des points de depart a equilibrer en playtest, marquees **[a tester]**.
>
> Ce lot de 25 cartes est un premier echantillon representatif du catalogue "Paw & Claw" (voir `docs/GAME_DESIGN.md`), pas le catalogue final : le reste des cartes illustrees par l'equipe doit etre transcrit ici au meme format au fur et a mesure que ses statistiques sont choisies. Chaque unite porte desormais une **Espece** (Chat ou Chien) : chaque camp ne pioche que dans les unites de sa propre espece (voir GAME_DESIGN.md section 1).

## Unites — Robots (6) — 3 Chats / 3 Chiens

| Carte | Espece | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|---|
| Petit Automate | Chat | 1 | 1 | 3 | Commune | Garde | Petit mais increvable. |
| Sentinelle a Ressort | Chien | 2 | 2 | 3 | Commune | — | Toujours prete a bondir. |
| Golem d'Horlogerie | Chat | 3 | 2 | 5 | Rare | Garde | Chaque rouage compte. |
| Ingenieure Renarde | Chien | 4 | 4 | 4 | Rare | — | Elle repare ce que la guerre casse. |
| Automate de Siege | Chat | 5 | 5 | 6 | Epique | Garde | Un mur qui avance. |
| Gardien Botanique | Chien | 6 | 5 | 8 | Legendaire | Garde | Il prend soin du petit au grand, pour un monde plus serein. |

## Unites — Nobles (6) — 3 Chats / 3 Chiens

| Carte | Espece | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|---|
| Jeune Noble | Chien | 1 | 1 | 2 | Commune | — | De grands reves pour demain. |
| Chambellan | Chat | 2 | 2 | 2 | Commune | — | L'ordre fait la grandeur. |
| Comtesse Elegante | Chat | 3 | 2 | 4 | Rare | — | La grace est une forme de pouvoir. |
| Chevalier Royal | Chien | 4 | 4 | 4 | Rare | Garde | L'honneur guide chacun de mes pas. |
| Roi Protecteur | Chien | 5 | 4 | 6 | Epique | — | Ecouter. Comprendre. Agir pour tous. |
| Souveraine Aurelia | Chat | 6 | 5 | 7 | Legendaire | Bouclier | Elle eclaire les chemins, meme dans l'ombre. |

## Unites — Sante (6) — 3 Chats / 3 Chiens

| Carte | Espece | Cout | ATQ | PV | Rarete | Mots-cles | Citation |
|---|---|---|---|---|---|---|---|
| Infirmiere Souris | Chien | 1 | 1 | 2 | Commune | — | Toujours la premiere sur le terrain. |
| Brancardier Beagle | Chien | 2 | 1 | 4 | Commune | — | Personne n'est laisse derriere. |
| Eclaireur Convalescent | Chien | 3 | 2 | 4 | Rare | — | Gueri, mais pas oublie. |
| Mediatrice Maine Coon | Chat | 4 | 3 | 5 | Epique | — | Elle apaise les tempetes et rassemble les coeurs. |
| Sage Siamois | Chat | 5 | 3 | 6 | Epique | — | Il percoit la douleur meme dans le silence. |
| Archidruide Felin | Chat | 6 | 4 | 7 | Legendaire | Bouclier | Elle guerit au-dela des blessures, et rappelle que l'espoir existe toujours. |

## Sorts (7) — neutres, disponibles pour les deux especes

| Carte | Cout | Rarete | Cible | Effet |
|---|---|---|---|---|
| Benediction Legere | 1 | Commune | Alliee (unite ou heros) | Rend 3 PV a la cible. |
| Eclair Arcanique | 2 | Commune | Ennemie (unite ou heros) | Inflige 3 degats a la cible. |
| Etourdissement | 2 | Commune | Unite ennemie | Empeche la cible d'attaquer lors de son prochain tour. |
| Savoir Ancestral | 2 | Rare | Aucune | Fait piocher 2 cartes. |
| Poison Sournois | 3 | Rare | Unite ennemie | Inflige 2 degats a la cible a chaque debut de tour, tant qu'elle reste en jeu. |
| Rang Serre | 3 | Rare | Unite alliee | Donne Garde et +2 PV a la cible. |
| Jugement Royal | 5 | Epique | Unite ennemie de cout ≤ 3 | Detruit la cible. |

## Synergies de tribu

Voir `docs/GAME_DESIGN.md` section 6 pour le detail :
- Nobles : +1 ATQ a son propre camp des que 2 Nobles sont en jeu.
- Robots : +1 ATQ a son propre camp ET -1 ATQ a tout le camp adverse des que 2 Robots sont en jeu (buff + debuff).
- Sante : +2 ATQ a son propre camp des que 3 unites Sante sont en jeu.

## A faire

- Illustrations reelles recues et traitees (voir `docs/ASSETS.md` pour l'inventaire complet) : `robot-gardien-botanique`, `noble-souveraine-aurelia` et `sante-archidruide-felin` ont desormais leur `art` renseigne dans `data/cards.json`. Les 20 autres cartes du prototype attendent qu'une generation soit choisie par tribu (plusieurs existent en parallele, voir `docs/ASSETS.md` section 3) avant de pouvoir leur assigner une illustration definitive.
- Transcrire le reste du catalogue illustre (autres cartes Nobles/Robots/Sante deja concues, et toute nouvelle tribu) avec des statistiques testees, en assignant une Espece coherente avec chaque illustration.
- Ecrire des capacites textuelles propres a certaines cartes au-dela des mots-cles generiques (le champ `capacite` existe deja dans le schema mais n'est pas encore exploite par le moteur).
- Playtester les couts/stats — tout est marque comme point de depart, pas final.
