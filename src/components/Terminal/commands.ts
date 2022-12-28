import { Buffer, Command } from "./models";
import * as sounds from "../../hooks/sounds";
import useGame from "../../stores/game";
import { getCardSuitName } from "../../models/card";

export const customCommands: Command[] = [
    {
        name: "game",
        description: "Game utility",
        execute: (args: string[], buffer: Buffer) => {
            if (args.length === 0) {
                buffer.write("Usage: game <i>command</i>");
                buffer.write("Commands: draw");
                buffer.write("Example: game draw");
                return;
            }

            switch (args[0]) {
                case "draw":
                    const card = useGame.getState().Draw();
                    buffer.write(`You drew ${card.value} of ${getCardSuitName(card)}!`);
                default:
            }
        },
    },
    {
        name: "sound",
        description: "Sound utility",
        execute: (args: string[], buffer: Buffer) => {
            if (args.length === 0) {
                buffer.write("Usage: sound <i>command</i>");
                buffer.write("Commands: play, stop, list");
                buffer.write("Example: sound play bubbi_fuve --loop");
                return;
            }

            switch (args[0]) {
                case "play":
                    buffer.write("Playing sound...");
                    sounds.play(args[1] as sounds.SoundName, args[2] === "--loop");
                    break;
                case "stop":
                    buffer.write("Stopping all sounds...");
                    sounds.stopAll();
                    break;
                case "list":
                    buffer.write("Available sounds:");
                    buffer.write(sounds.SoundNames.join(", "));
                    break;
                default:
            }
        },
    },
    {
        name: "idhair",
        execute: (args: string[], buffer: Buffer) => {
            buffer.write("Drewsen <3");
            setTimeout(() => {
                window.open("https://www.youtube.com/watch?v=iL5_7Pey4xE", "_blank");
            }, 1000);
        },
    },
    {
        name: "important",
        execute: (args: string[], buffer: Buffer) => {
            buffer.write("yee...");

            setTimeout(() => {
                window.open(
                    "https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo",
                    "_blank"
                );
            }, 1000);
        },
    },
];
