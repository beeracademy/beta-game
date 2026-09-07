import * as sounds from "../../hooks/sounds";
import { getCardSuitName } from "../../models/card";
import useGame from "../../stores/game";
import type { Buffer, Command } from "./models";

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
          try {
            const [card] = useGame.getState().DrawCard();
            buffer.write(`You drew ${card.value} of ${getCardSuitName(card)}!`);
          } catch (error) {
            buffer.write(`Error: ${error}`);
          }
          break;
        default:
          break;
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
          sounds.play(args[1] as sounds.SoundName, {
            loop: args[2] === "--loop",
          });
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
          break;
      }
    },
  },
  {
    name: "idhair",
    execute: (_args: string[], buffer: Buffer) => {
      buffer.write("Drewsen <3");
      setTimeout(() => {
        window.open("https://www.youtube.com/watch?v=iL5_7Pey4xE", "_blank");
      }, 1000);
    },
  },
  {
    name: "important",
    execute: (_args: string[], buffer: Buffer) => {
      buffer.write("yee...");

      setTimeout(() => {
        window.open(
          "https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo",
          "_blank",
        );
      }, 1000);
    },
  },
  {
    name: "olderenneger",
    execute: (_args: string[], buffer: Buffer) => {
      const isEnabled = document.documentElement.classList.toggle("old");
      document.body.classList.toggle("old");
      if (isEnabled) {
        buffer.write("Hula bula!");
        sounds.play("old");
      }
    },
  },
  {
    name: "old",
    execute: (_args: string[], buffer: Buffer) => {
      const isEnabled = document.documentElement.classList.toggle("old");
      document.body.classList.toggle("old");
      if (isEnabled) {
        buffer.write("Hula bula!");
        sounds.play("old");
      }
    },
  },
  {
    name: "downunder",
    execute: (_args: string[], buffer: Buffer) => {
      const isEnabled = document.documentElement.classList.toggle("downunder");
      if (isEnabled) {
        buffer.write("G'day mate! Welcome to the land Down Under! 🦘");
        sounds.play("downunder");
      }
    },
  },
  {
    name: "yee",
    execute: (_args: string[], buffer: Buffer) => {
      buffer.write("yee...");

      setTimeout(() => {
        window.open(
          "https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo",
          "_blank",
        );
      }, 1000);
    },
  },
];
