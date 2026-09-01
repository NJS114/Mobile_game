import { TRANCHEE_SLOTS } from "../constants.js";

// Etat d'un couloir pour UN camp (chaque joueur a ses 3 PlayerLaneState).
// Chaque methode fait une seule chose, pour rester facile a tester/relire.
export class PlayerLaneState {
  constructor() {
    this.reserve = [];
    this.tranchee = new Array(TRANCHEE_SLOTS).fill(null);
    this.front = null;
    this.tunnel = null;
    this.tunnelTurnsHidden = 0;
    this.flagControlStreak = 0;
  }

  hasFreeTrancheeSlot() {
    return this.tranchee.some((slot) => slot === null);
  }

  placeInTranchee(instance) {
    const freeIndex = this.tranchee.indexOf(null);
    if (freeIndex === -1) return false;
    this.tranchee[freeIndex] = instance;
    return true;
  }

  removeFromTranchee(instanceId) {
    const index = this.tranchee.findIndex((c) => c && c.instanceId === instanceId);
    if (index === -1) return null;
    const removed = this.tranchee[index];
    this.tranchee[index] = null;
    return removed;
  }

  removeFromReserve(instanceId) {
    const index = this.reserve.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return null;
    return this.reserve.splice(index, 1)[0];
  }

  findAnywhere(instanceId) {
    if (this.front?.instanceId === instanceId) return this.front;
    if (this.tunnel?.instanceId === instanceId) return this.tunnel;
    return (
      this.reserve.find((c) => c.instanceId === instanceId) ??
      this.tranchee.find((c) => c && c.instanceId === instanceId) ??
      null
    );
  }
}
