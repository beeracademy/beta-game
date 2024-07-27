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

    description: options.description,
  };
};

const playerIndexesToIds = (state: GameState, indexes: number[]): number[] => {
  return indexes.map((index) => state.players[index].id as number);
};

const mapToLocal = (game: Game): GameState => {
  return {
    id: game.id,
    token: game.token,

    offline: !game.official,
    sipsInABeer: 14,
    numberOfRounds: 13,

    gameStartDateString: game.start_datetime,
    gameStartTimestamp: Date.parse(game.start_datetime),
    turnStartTimestamp: 0, // TODO: Implement
    gameEndTimestamp: 0, // TODO: Implement

    players: game.player_names.map((name, index) => ({
      id: game.player_ids[index],
      username: name,
    })),

    shuffleIndices: game.shuffle_indices,

    draws: game.cards,

    dnf_player_indexes: playerIdsToIndexes(game, game.dnf_player_ids),
  };
};

const playerIdsToIndexes = (game: Game, ids: number[]): number[] => {
  return ids.map((id) => game.player_ids.indexOf(id));
};

export { mapToLocal, mapToRemote };
