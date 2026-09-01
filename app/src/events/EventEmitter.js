// Observer Pattern minimal : decouple le moteur (Game) de l'interface.
// Le moteur emet des evenements, l'UI s'y abonne sans que Game connaisse
// l'existence du DOM.
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
    return this;
  }

  emit(eventName, payload) {
    for (const handler of this.listeners.get(eventName) ?? []) {
      handler(payload);
    }
  }
}
