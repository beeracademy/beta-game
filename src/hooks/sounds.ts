import { Howl, Howler } from "howler";

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
];

type SoundName = typeof SoundNames[number];

SoundNames.forEach((soundName) => {
    new Howl({
        src: [`/sounds/${soundName}.mp3`, `sounds/${soundName}.ogg`],
        preload: true,
    });
});

const useSounds = () => {
    return {
        play: play,
        stopAll: stopAll,
    };
};

const play = (soundName: SoundName, loop?: boolean) => {
    const sound = new Howl({
        src: [`/sounds/${soundName}.mp3`, `/sounds/${soundName}.ogg`],
        loop,
    });
    sound.play();

    return sound;
};

function stopAll() {
    Howler.stop();
}

export { useSounds, play, stopAll, SoundNames };
export type { SoundName };

