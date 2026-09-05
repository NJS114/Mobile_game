// Strategy Pattern (facon TFT) : une synergie de tribu octroie un bonus
// d'attaque a toutes les unites d'une tribu des qu'un certain nombre
// d'entre elles sont sur le plateau du meme joueur, et peut aussi infliger
// un malus d'attaque a toutes les unites adverses (interference/sabotage) -
// un meme mecanisme, applique a son propre camp (buff) ou au camp adverse
// (debuff). Ajouter une tribu ne demande qu'une nouvelle instance, jamais
// de toucher au moteur.
export class TribeSynergy {
  constructor(tribu, seuil, ownAtqBonus, enemyAtqBonus = 0) {
    this.tribu = tribu;
    this.seuil = seuil;
    this.ownAtqBonus = ownAtqBonus;
    this.enemyAtqBonus = enemyAtqBonus;
  }

  countOnBoard(board) {
    return board.filter((unit) => unit.card.tribu === this.tribu).length;
  }

  apply(ownBoard, enemyBoard) {
    if (this.countOnBoard(ownBoard) < this.seuil) return;
    for (const unit of ownBoard) {
      if (unit.card.tribu === this.tribu) unit.bonusAtq += this.ownAtqBonus;
    }
    if (this.enemyAtqBonus) {
      for (const unit of enemyBoard) unit.bonusAtq += this.enemyAtqBonus;
    }
  }
}
