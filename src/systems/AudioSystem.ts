// NOTES:
// - We are ignoring AudioListener components and always treating the player as the listener.
// - We are not separating audio events and audio sources into separate systems. This will do both.

import { AudioManager } from "../AudioManager/AudioManager";
import { EventMessageName } from "../enums";
import {
  PlayerEntity,
  AudioSourceComponent,
  ObjectEntity,
} from "../raymarcher";
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
    this.audioManager.playSound(e.name);
  };
  update(dt: number) {
    const audioSourceEntities: ObjectEntity[] = this.ecs.entityManager.with([
      "audioSource",
      "transform",
    ]);

    // NOTE: Ignoring direction. Too much.
    const listenerPosition = this.audioListenerEntity.transform.position;

    for (const audioSourceEntity of audioSourceEntities) {
      // First thing we want to do is exclude any sources that are too far away from the listener (player).
      const audioSourcePosition = audioSourceEntity.transform.position;
      const { audioSource } = audioSourceEntity;
      const {
        name,
        fullVolumeRadius,
        anyVolumeRadius,
        volume,
        looping,
        isPlaying,
        spriteId,
      } = audioSource!;

      const distanceTolistener =
        audioSourcePosition.distanceTo(listenerPosition);

      if (distanceTolistener > anyVolumeRadius) {
        // TODO: Pause anything looping. (TTL would be good for stuff not looping that still shoudl be removed even if it doesn't finish)
        if (isPlaying && spriteId) {
          // How does pausing work if multiple people use the same sound??
          // Apparently when pausing we get an id back, and we need to use that...
          this.audioManager.pauseSound(spriteId);
        }
        continue;
      }
      // TODO: Volume drop off.
      if (!isPlaying && !spriteId) {
        // This should be the first and only time an audio source is started. (Only looping ones should not be removed on completion IMHO)
        const spriteId = this.audioManager.playSound(name);
        audioSourceEntity.audioSource!.isPlaying = true;
        // There shoudl be a sprite/ID, but howler typings are not very accurate.
        if (spriteId) {
          audioSourceEntity.audioSource!["spriteId"] = spriteId;
          if (looping) {
            this.audioManager.updateSoundLoopValue(spriteId, true);
            // TODO: I shouldn't be directly manipulating howler properties. All of this should go through audio manager (though, I have no intent of changing the library so...myabe that's unnecessary)
            // const sound = this.audioManager.getSound(name);
            // if (sound) {
            //   sound.loop(true, spriteId);
            // }
          }
        }
        // How does pausing work if multiple people use the same sound??
        // this.audioManager.pauseSound(name);
      }
      // TODO: Need to come back to this sequencing.
      if (spriteId && !this.audioManager.isPlaying(spriteId)) {
        this.audioManager.playSound(spriteId);
      }
    }
  }
}
