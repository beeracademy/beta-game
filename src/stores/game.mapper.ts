import { Card } from "../models/card";
import { Game } from "../api/models/game";
import { GameState } from "./game";

const mapToRemote = (
  state: GameState,
  options: {
    dnf: boolean;
    has_ended: boolean;
    description?: string;
  } = {
    dnf: false,
    has_ended: false,
    description: undefined,
  },
): Game => {
  return {
    id: state.id as number,
    token: state.token as string,

    start_datetime: state.gameStartDateString,

    player_names: state.players.map((player) => player.username),
    player_ids: state.players.map((player) => player.id as number),

    official: !state.offline,
    shuffle_indices: state.shuffleIndices,
    has_ended: options.has_ended,

    cards: state.draws,

    dnf_player_ids: playerIndexesToIds(state, state.dnf_player_indexes),
    dnf: options.dnf,

    description: options.description ?? state.description,
  };
};

const playerIndexesToIds = (state: GameState, indexes: number[]): number[] => {
  return indexes
    .filter((index) => state.players[index] && state.players[index].id !== undefined)
    .map((index) => state.players[index].id as number);
};

const deriveTurnStartTimestamp = (
  gameStartTimestamp: number,
  draws: Card[],
): number => {
  if (!draws || draws.length === 0) {
    return gameStartTimestamp;
  }
  const lastCard = draws[draws.length - 1];
  if (lastCard.value === 14 && lastCard.chug_end_start_delta_ms) {
    return gameStartTimestamp + lastCard.chug_end_start_delta_ms;
  }
  return gameStartTimestamp + (lastCard.start_delta_ms || 0);
};

const deriveGameEndTimestamp = (
  gameStartTimestamp: number,
  draws: Card[],
  numberOfCards: number,
): number => {
  if (!draws || numberOfCards <= 0 || draws.length < numberOfCards) {
    return 0;
  }
  const lastCard = draws[draws.length - 1];
  if (lastCard?.value === 14 && lastCard?.chug_end_start_delta_ms) {
    return gameStartTimestamp + lastCard.chug_end_start_delta_ms;
  }
  return gameStartTimestamp + (lastCard?.start_delta_ms || 0);
};

const mapToLocal = (game: Game): GameState => {
  const gameStartTimestamp = Date.parse(game.start_datetime) || Date.now();
  const draws = game.cards || [];

  const rawPlayers: Array<{ id?: number; username: string; image?: string }> =
    (game as any).players ??
    (game.player_names || []).map((name, index) => ({
      id: game.player_ids?.[index],
      username: name,
    }));

  const players = rawPlayers.map((p) => ({
    id: p.id,
    username: p.username,
    image: p.image,
  }));

  const numberOfCards = players.length * 13;
  const turnStartTimestamp = deriveTurnStartTimestamp(
    gameStartTimestamp,
    draws,
  );
  const gameEndTimestamp = deriveGameEndTimestamp(
    gameStartTimestamp,
    draws,
    numberOfCards,
  );

  return {
    id: game.id,
    token: game.token,

    offline: !game.official,
    sipsInABeer: (game as any).sips_per_beer || 14,
    numberOfRounds: 13,

    gameStartDateString: game.start_datetime,
    gameStartTimestamp,
    turnStartTimestamp,
    gameEndTimestamp,

    players,
    shuffleIndices: game.shuffle_indices || [],
    draws,

    dnf_player_indexes: playerIdsToIndexes(players, game.dnf_player_ids),

    description: game.description,
    image: (game as any).image,
  };
};

const playerIdsToIndexes = (
  players: Array<{ id?: number }>,
  ids: number[] | undefined,
): number[] => {
  if (!ids) return [];
  const playerIds = players.map((p) => p.id);
  return ids
    .map((id) => playerIds.indexOf(id))
    .filter((index) => index !== -1);
};

export { mapToLocal, mapToRemote, deriveTurnStartTimestamp, deriveGameEndTimestamp };
