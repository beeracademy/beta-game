import { Game } from "../api/models/game";
import { CardValues } from "../models/card";
import { GameState } from "./game";

const mapToRemote = (state: GameState): Game => {
  return {
    id: state.id as number,
    token: state.token as string,

    start_datetime: state.gameStartDateString,

    player_names: state.players.map((player) => player.username),
    player_ids: state.players.map((player) => player.id as number),

    official: !state.offline,
    shuffle_indices: state.shuffleIndices,
    has_ended:
      state.draws.length === (CardValues.length - 1) * state.players.length,

    cards: state.draws,

    dnf_player_ids: state.dnf_player_ids,
    dnf: false, // TODO: Implement
  };
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

    dnf_player_ids: game.dnf_player_ids,
  };
};

export { mapToLocal, mapToRemote };
