import { randInt } from "../../utilities/random";

const HYPE_MESSAGES = [
	"CHUG TIME!",
	"BOTTOMS UP!",
	"DRINK UP!",
	"ACE OF SPADES... CHUG!",
	"HERE WE GO!",
	"DOWN THE HATCH!",
	"SEND IT!",
	"GLUG GLUG GLUG!",
	"NO SIP LEFT BEHIND!",
	"TIME TO HYDRATE... AGGRESSIVELY!",
	"MAKE IT DISAPPEAR!",
	"OPEN THE FLOODGATES!",
	"LOCK IN AND CHUG!",
	"STORE SLURKE, TÆNK SOM EN FISK",
];

const KING_MESSAGES = (name: string) => [
	`${name} TAKES THE CROWN!`,
	`ALL HAIL ${name}!`,
	`${name} IS THE KING!`,
	`${name} SEIZES THE LEAD!`,
	`BOW BEFORE ${name}!`,
	`LONG LIVE ${name}!`,
	`${name} SITS ON THE THRONE!`,
	`ROYALTY HAS ENTERED: ${name}!`,
	`${name} RULES THEM ALL!`,
	`BEND THE KNEE TO ${name}!`,
	`MAKE WAY FOR KING ${name}!`,
	`${name} LOOKS DOWN UPON MORTALS!`,
	`THE CROWN SUITS ${name} WELL!`,
	`${name} CANNOT BE STOPPED!`,
	`${name} IS RUNNING THE SHOW!`,
	`${name} IS THE GOAT!`,
	`W ${name}, MASSIVE W!`,
	`${name} IS HIM!`,
	`SIGMA GRINDSET: ${name} EDITION!`,
	`${name} JUST HIT DIFFERENT!`,
	`${name} IS COOKING AND THEY KNOW IT!`,
	`${name} ASCENDED TO MAIN CHARACTER!`,
	`${name} HAS ENTERED THEIR ERA!`,
	`${name} IS UNSPOKEN RIZZ!`,
];

const JESTER_MESSAGES = (name: string) => [
	`PITY ${name}...`,
	`${name} FALLS TO LAST PLACE!`,
	`DANCE FOR US, ${name}!`,
	`HONK HONK! HERE COMES ${name}!`,
	`${name} DROPPED THE CROWN...`,
	`PRESS F FOR ${name}!`,
	`FROM HERO TO ZERO: ${name}!`,
	`LOOK AT ${name} STRUGGLING!`,
	`ROCK BOTTOM FOUND: IT'S ${name}!`,
	`${name} GOT L + RATIO'D!`,
	`${name} IS SO UNSERIOUS RIGHT NOW!`,
	`SKILL ISSUE, ${name}!`,
	`${name} IS DOWN CATASTROPHIC BAD!`,
	`${name} FUMBLED THE BAG!`,
	`${name} HAS LEFT THE CHAT!`,
	`NPC BEHAVIOR FROM ${name}!`,
	`${name} IS MID AND EVERYONE KNOWS IT!`,
	`RIP ${name}, YOU WILL NOT BE MISSED!`,
	`${name} JUST GOT CLOWNED ON!`,
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
