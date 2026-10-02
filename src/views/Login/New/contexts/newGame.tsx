import type React from "react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Player {
  id?: number;

  username: string;
  ready: boolean;

  password?: string;
  image?: string;
  token?: string;
}

interface NewGameContextType {
  ready: boolean;

  players: Player[];
  setPlayer: (
    index: number,
    player: Player | ((prev: Player) => Player),
  ) => void;

  numberOfPlayers: number;
  offline: boolean;

  setNumberOfPlayers: (number: number) => void;
  setOffline: (offline: boolean) => void;

  title: string;
  setTitle: (title: string) => void;

  wide: boolean;
  setWide: (wide: boolean) => void;
}

// Context
const NewGameContext = createContext<NewGameContextType | undefined>(undefined);

interface NewGameProviderProps {
  children: ReactNode;
}

// Provider
export const NewGameProvider: React.FC<NewGameProviderProps> = ({
  children,
}) => {
  const [ready, setReady] = useState<boolean>(false);

  const [offline, setOffline] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("New Game");
  const [wide, setWide] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>(() =>
    Array.from({ length: 4 }, () => ({
      username: "",
      ready: false,
    })),
  );

  const numberOfPlayers = players.length;

  useEffect(() => {
    setReady(players.length > 0 && players.every((player) => Boolean(player?.ready)));
  }, [players]);

  const setPlayerHandler = (
    index: number,
    playerOrUpdater: Player | ((prev: Player) => Player),
  ) => {
    setPlayers((prev) => {
      if (index >= prev.length) {
        return prev;
      }
      const updatedPlayer =
        typeof playerOrUpdater === "function"
          ? playerOrUpdater(prev[index])
          : playerOrUpdater;

      return [
        ...prev.slice(0, index),
        updatedPlayer,
        ...prev.slice(index + 1),
      ];
    });
  };

  const setNumberOfPlayersHandler = (number: number) => {
    setPlayers((prev) => {
      if (number < prev.length) {
        return prev.slice(0, number);
      } else {
        const added = Array.from(
          { length: number - prev.length },
          () => ({
            username: "",
            ready: false,
          }),
        );
        return [...prev, ...added];
      }
    });
  };

  const setOfflineHandler = (offline: boolean) => {
    setOffline(offline);

    setPlayers((prev) =>
      prev.map((player, i) => {
        if (offline) {
          return {
            id: i,
            username: player.username || "",
            ready: !!player.username,
          };
        } else {
          return {
            username: player.username || "",
            ready: false,
          };
        }
      }),
    );
  };

  return (
    <NewGameContext.Provider
      value={{
        ready,

        players,
        setPlayer: setPlayerHandler,

        numberOfPlayers,
        setNumberOfPlayers: setNumberOfPlayersHandler,

        offline,
        setOffline: setOfflineHandler,

        title,
        setTitle,

        wide,
        setWide,
      }}
    >
      {children}
    </NewGameContext.Provider>
  );
};

// Hook
export const useNewGame = (): NewGameContextType => {
  const context = useContext(NewGameContext);

  if (context === undefined) {
    throw new Error("useNewGame must be used within a NewGameProvider");
  }

  return context;
};
