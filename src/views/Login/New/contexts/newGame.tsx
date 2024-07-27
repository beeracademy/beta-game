import React, {
  ReactNode,
  createContext,
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
  setPlayer: (index: number, player: Player) => void;

  numberOfPlayers: number;
  offline: boolean;

  setNumberOfPlayers: (number: number) => void;
  setOffline: (offline: boolean) => void;
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

  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(4);
  const [offline, setOffline] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>(
    new Array(numberOfPlayers).fill({}),
  );

  useEffect(() => {
    setReady(players.every((player) => player.ready));
  }, [players]);

  const setPlayerHandler = (index: number, player: Player) => {
    setPlayers([
      ...players.slice(0, index),
      player,
      ...players.slice(index + 1),
    ]);
  };

  const setNumberOfPlayersHandler = (number: number) => {
    setNumberOfPlayers(number);

    if (number < players.length) {
      setPlayers([...players.slice(0, number)]);
    } else {
      setPlayers([...players, ...new Array(number - players.length).fill({})]);
    }
  };

  const setOfflineHandler = (offline: boolean) => {
    setOffline(offline);

    if (offline) {
      setPlayers([
        ...players.map((player, i) => {
          return {
            id: i,
            username: player.username,
            ready: !!player.username,
          };
        }),
      ]);
    }

    if (!offline) {
      setPlayers([
        ...players.map((player) => {
          return {
            username: player.username,
            ready: false,
          };
        }),
      ]);
    }
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
