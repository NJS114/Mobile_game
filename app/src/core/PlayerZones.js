import { TRANCHEE_SLOTS, FRONT_CAPACITY } from "../constants.js";

// Zones d'un joueur : reserve, tranchee (cachee), front (partage, cartes
// libres - voir docs/GAME_DESIGN.md), et un tunnel optionnel.
export class PlayerZones {
  constructor() {
    this.reserve = [];
    this.tranchee = new Array(TRANCHEE_SLOTS).fill(null);
    this.front = [];
    this.tunnel = null;
    this.tunnelTurnsHidden = 0;
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

  hasFreeFrontSlot() {
    return this.front.length < FRONT_CAPACITY;
  }

  addToFront(instance) {
    if (!this.hasFreeFrontSlot()) return false;
    this.front.push(instance);
    return true;
  }

  removeFromFront(instanceId) {
    const index = this.front.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return null;
    return this.front.splice(index, 1)[0];
  }

  findAnywhere(instanceId) {
    return (
      this.front.find((c) => c.instanceId === instanceId) ??
      (this.tunnel?.instanceId === instanceId ? this.tunnel : null) ??
      this.reserve.find((c) => c.instanceId === instanceId) ??
      this.tranchee.find((c) => c && c.instanceId === instanceId) ??
      null
    );
  }
}
