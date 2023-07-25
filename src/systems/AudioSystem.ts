// NOTES:
// - We are ignoring AudioListener components and always treating the player as the listener.
// - We are not separating audio events and audio sources into separate systems. This will do both.

import { AudioManager } from "../AudioManager/AudioManager";
import { EventMessageName } from "../enums";
import { PlayerEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";

export class AudioSystem implements System {
  private ecs: ECS;
  private audioManager: AudioManager;
  private broker: Broker;
  private audioListenerEntity: PlayerEntity;

  constructor(
    ecs: ECS,
    audioManager: AudioManager,
    broker: Broker,
    audioListenerEntity: PlayerEntity
  ) {
    this.ecs = ecs;
    this.audioManager = audioManager;
    this.broker = broker;
    this.audioListenerEntity = audioListenerEntity;

    this.broker.subscribe(
      EventMessageName.PlaySound,
      this.handlePlaySoundEvent
    );
  }

  handlePlaySoundEvent = (e) => {
    console.log(e, this.audioManager);
    this.audioManager.playSound(e.name);
  };
  update(dt: number) {}
}
