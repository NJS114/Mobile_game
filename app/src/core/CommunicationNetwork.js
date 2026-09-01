import { LANES } from "../constants.js";

export class CommunicationNetwork {
  constructor() {
    this.status = Object.fromEntries(LANES.map((lane) => [lane, "actif"]));
  }

  isActive(lane) {
    return this.status[lane] === "actif";
  }

  cut(lane) {
    this.status[lane] = "coupe";
  }

  repair(lane) {
    this.status[lane] = "actif";
  }
}
