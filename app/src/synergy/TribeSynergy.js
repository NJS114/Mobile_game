// Strategy Pattern (facon TFT) : une synergie de tribu octroie un bonus
// d'attaque a toutes les unites d'une tribu des qu'un certain nombre
// d'entre elles sont sur le plateau du meme joueur. Ajouter une tribu ne
// demande qu'une nouvelle instance, jamais de toucher au moteur.
export class TribeSynergy {
  constructor(tribu, seuil, bonusAtq) {
    this.tribu = tribu;
    this.seuil = seuil;
    this.bonusAtq = bonusAtq;
  }

  countOnBoard(board) {
    return board.filter((unit) => unit.card.tribu === this.tribu).length;
  }

  apply(board) {
    if (this.countOnBoard(board) < this.seuil) return;
    for (const unit of board) {
      if (unit.card.tribu === this.tribu) unit.bonusAtq += this.bonusAtq;
    }
  }
}
