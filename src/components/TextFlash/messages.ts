import { randInt } from "../../utilities/random";

const HYPE_MESSAGES = [
  "CHUG TIME!",
  "BOTTOMS UP!",
  "DRINK UP!",
  "ACE OF SPADES... CHUG!",
  "HERE WE GO!",
];

const KING_MESSAGES = (name: string) => [
  `${name} TAKES THE CROWN!`,
  `ALL HAIL ${name}!`,
  `${name} IS THE KING!`,
  `${name} SEIZES THE LEAD!`,
];

const JESTER_MESSAGES = (name: string) => [
  `${name} IS THE JESTER!`,
  `PITY ${name}...`,
  `${name} FALLS TO LAST PLACE!`,
  `${name} WEARS THE BELLS!`,
];

// Mirrors the actual spoken phrase of the kill-streak sound played in ChugDialog (streaks start at 2)
const KILL_STREAK_MESSAGES: Record<number, string> = {
  2: "DOUBLE KILL!!",
  3: "TRIPLE KILL!!",
  4: "ULTRA KILL!!",
  5: "MEGA KILL!!",
  6: "MONSTER KILL!!",
};

function pickRandom(options: string[]): string {
  return options[randInt(0, options.length - 1)];
}

function pickHypeMessage(): string {
  return pickRandom(HYPE_MESSAGES);
}

function pickKingMessage(name: string): string {
  return pickRandom(KING_MESSAGES(name));
}

function pickJesterMessage(name: string): string {
  return pickRandom(JESTER_MESSAGES(name));
}

function pickKillStreakMessage(count: number): string | undefined {
  return KILL_STREAK_MESSAGES[count];
}

export {
  pickHypeMessage,
  pickJesterMessage,
  pickKillStreakMessage,
  pickKingMessage,
};
