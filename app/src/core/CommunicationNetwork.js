// Plateau simplifie : une seule ligne de communication partagee (plus de
// decoupage par couloir). Coupee, elle bloque les deplacements des deux
// camps ; n'importe quel camp peut la reparer.
export class CommunicationNetwork {
  constructor() {
    this.status = "actif";
  }

  isActive() {
    return this.status === "actif";
  }

  cut() {
    this.status = "coupe";
  }

  repair() {
    this.status = "actif";
  }
}
