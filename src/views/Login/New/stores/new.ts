import create from "zustand";
import { Player } from "../../../../models/player";
import { GameMode } from "../../components/GameModeSelector";

interface NewGameState {
  ready: boolean;
  numberOfPlayers: number;
  gameMode: GameMode;
  players: Player[];
  playerReady: boolean[];
}

interface NewGameAction {
  SetNumberOfPlayers: (value: number) => void;
  SetGameMode: (value: GameMode) => void;
  SetPlayer(index: number, player: Player): void;
  RemovePlayer(index: number): void;
  SetPlayerReady(index: number, ready: boolean): void;
}

const initialState: NewGameState = {
  ready: false,
  numberOfPlayers: 4,
  gameMode: "normal",
  players: [],
  playerReady: [],
};

const useNewGameForm = create<NewGameState & NewGameAction>()((set, get) => ({
  ...initialState,

  SetNumberOfPlayers: (value: number) => {
    const { players, playerReady } = get();

    set((state) => ({ numberOfPlayers: value }));

    if (value < players.length) {
      set((state) => ({ players: players.slice(0, value) }));
      set((state) => ({ playerReady: playerReady.slice(0, value) }));
    } else {
      set((state) => ({
        players: [
          ...players,
          ...Array(value - players.length).fill({
            name: "",
          }),
        ],
      }));
      set((state) => ({
        playerReady: [
          ...playerReady,
          ...Array(value - playerReady.length).fill(false),
        ],
      }));
    }
  },

  SetGameMode: (value: GameMode) => {
    set((state) => ({ gameMode: value }));
  },

  SetPlayer: (index: number, player: Player) => {
    set((state) => {
      const players = [...state.players];
      players[index] = player;
      return { players };
    });
  },

  RemovePlayer: (index: number) => {
    set((state) => {
      const players = [...state.players];
      players.splice(index, 1);
      return { players };
    });
  },

  SetPlayerReady: (index: number, ready: boolean) => {
    set((state) => {
      const playerReady = [...state.playerReady];
      playerReady[index] = ready;

      return { playerReady, ready: playerReady.every((ready) => ready) };
    });
  },
}));

export default useNewGameForm;
