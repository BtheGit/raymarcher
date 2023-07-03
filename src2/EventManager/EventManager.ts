// This is going to be absolutely not an event system short term. Just pretending.
// The main thing we are doing at this point is passing the rays froma  raycaster to a renderer. A secondary concern, and small optimization, is having the renderer check the frameId and skip new work if it's already rendered the frame with that id;

import { Ray } from "../raymarcher";

export class EventManager {
  private _rays: Ray[];
  private _raysId: number;

  set rays(rays: Ray[]) {
    this._rays = rays;
    this._raysId = Date.now();
  }

  get nextRays() {
    return { rays: this._rays, id: this._raysId };
  }
}
