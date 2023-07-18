// Something very basic to get started.

export class Broker {
  private listeners: Map<string, ((event: any) => void)[]>;

  constructor() {
    this.listeners = new Map();
  }

  public subscribe(eventType: string, listener: (event: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  public unsubscribe(eventType: string, listener: (event: any) => void): void {
    if (!this.listeners.has(eventType)) return;
    const listeners = this.listeners.get(eventType)!;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  public emit(eventType: string, event?: any): void {
    if (!this.listeners.has(eventType)) return;
    const listeners = this.listeners.get(eventType)!;
    listeners.forEach((listener) => listener(event));
  }
}
