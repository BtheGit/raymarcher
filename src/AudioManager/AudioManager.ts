import { Howl, Howler } from "howler";

export class AudioManager {
  private sounds = new Map<string, Howl>();

  constructor() {
    Howler.volume(1);
  }

  loadSounds = (soundMap: Record<string, string>) => {
    for (const [name, src] of Object.entries(soundMap)) {
      this.loadSound(name, src);
    }
  };

  loadSound = (name: string, src: string) => {
    this.sounds.set(
      name,
      new Howl({
        src: [src],
        preload: true,
      })
    );
  };

  playSound = (name: string) => {
    const sound = this.sounds.get(name);
    if (!sound) {
      return;
    }
    console.log(sound);
    // @ts-expect-error
    sound.play();
  };

  pauseSound = (name: string) => {
    const sound = this.sounds.get(name);
    if (!sound) {
      return;
    }

    // @ts-expect-error
    sound.pause();
  };

  stopSound = (name: string) => {
    const sound = this.sounds.get(name);
    if (!sound) {
      return;
    }
    // @ts-expect-error
    sound.stop();
  };

  // TODO: Set Volume
}
