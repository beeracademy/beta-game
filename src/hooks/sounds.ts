import { Howl } from "howler";

/*
  Add new sound files to the public/sounds folder and add the file name to the SoundNames array.
  All sound files must be in .mp3 and .ogg format to support all browsers.
*/

const SoundNames = [
  "baladada",
  "big_chungus",
  "bubbi_fuve",
  "cheering",
  "click",
  "crown",
  "dick",
  "doublekill",
  "homosangen_fuve",
  "humiliation",
  "loser",
  "megakill",
  "mimimi",
  "mkd_fatality",
  "mkd_finishim",
  "mkd_flawless",
  "mkd_laugh",
  "monsterkill",
  "moops",
  "multikill",
  "old",
  "ole_vedel",
  "slot_machine_winner",
  "slot_machine",
  "snack",
  "triplekill",
  "tryk_paa_den_lange_tast",
  "ultrakill",
  "wicked",
  "firework",
  "camera_shutter",
  "wilhelm_scream",
] as const;

type SoundName = (typeof SoundNames)[number];

const activeSounds = new Map<SoundName, Howl[]>();

SoundNames.forEach((soundName) => {
  new Howl({
    src: [`/sounds/${soundName}.mp3`, `/sounds/${soundName}.ogg`],
    preload: true,
  });
});

const useSounds = () => {
  return {
    play: play,

    pause: pause,

    mute: mute,
    unmute: unmute,

    stop: stop,
    stopAll: stopAll,
  };
};

interface playOptions {
  loop?: boolean;
  oneInstance?: boolean;
}

const play = (
  soundName: SoundName,
  options: playOptions = {
    loop: false,
    oneInstance: false,
  },
) => {
  const sound = new Howl({
    src: [`/sounds/${soundName}.mp3`, `/sounds/${soundName}.ogg`],
    loop: options.loop,
  });

  if (options.oneInstance) {
    const sounds = activeSounds.get(soundName);
    if (sounds && sounds.length > 0) {
      return sounds[0];
    }
  }

  sound.play();

  if (!activeSounds.has(soundName)) {
    activeSounds.set(soundName, []);
  }

  activeSounds.get(soundName)?.push(sound);

  if (!options.loop) {
    sound.once("end", () => {
      const sounds = activeSounds.get(soundName);
      if (sounds) {
        activeSounds.set(
          soundName,
          sounds.filter((s) => s !== sound),
        );
      }
    });
  }

  return sound;
};

const pause = (soundName: SoundName) => {
  const sounds = activeSounds.get(soundName);
  if (sounds) {
    sounds.forEach((sound) => sound.pause());
  }
};

const mute = (soundName: SoundName) => {
  const sounds = activeSounds.get(soundName);
  if (sounds) {
    sounds.forEach((sound) => sound.mute(true));
  }
};

const unmute = (soundName: SoundName) => {
  const sounds = activeSounds.get(soundName);
  if (sounds) {
    sounds.forEach((sound) => sound.mute(false));
  }
};

const stop = (soundName: SoundName) => {
  const sounds = activeSounds.get(soundName);
  if (sounds) {
    sounds.forEach((sound) => sound.stop());
    activeSounds.set(soundName, []);
  }
};

const stopAll = () => {
  activeSounds.forEach((sounds) => {
    sounds.forEach((sound) => sound.stop());
  });

  activeSounds.clear();
};

export { SoundNames, mute, pause, play, stop, stopAll, unmute, useSounds };
export type { SoundName };
