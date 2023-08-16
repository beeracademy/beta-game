import { Stack } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Player } from "../../../models/player";
import PlayerItem from "./PlayerItem";

interface PlayerListProps {
  numberOfPlayers: number;
  usernameOnly?: boolean;
  onPlayerReadyChange?: (index: number, players: Player) => void;
}

const PlayerList: FunctionComponent<PlayerListProps> = (props) => {
  const [players, setPlayers] = useState<{ [key: number]: Player }>();

  useEffect(() => {
    let newPlayers: { [key: number]: Player } = {};
    setPlayers((prev) => {
      newPlayers = { ...prev };

      Object.keys(newPlayers).forEach((k) => {
        const i = parseInt(k);

        if (i >= props.numberOfPlayers) {
          delete newPlayers[i];
        }
      });

      return newPlayers;
    });

    props.onChange?.(Object.values(newPlayers));
  }, [props.numberOfPlayers]);

  return (
    <Stack spacing={1}>
      {Array.from(Array(props.numberOfPlayers).keys()).map((_, i) => {
        return (
          <PlayerItem
            key={i}
            hidePassword={props.usernameOnly}
            onReady={(p) => {
              setPlayers((prev) => {
                const newPlayers = { ...prev };
                newPlayers[i] = p;

                props.onChange?.(Object.values(newPlayers));

                return newPlayers;
              });
            }}
            onRemove={() => {
              setPlayers((prev) => {
                const newPlayers = { ...prev };
                delete newPlayers[i];

                props.onChange?.(Object.values(newPlayers));

                return newPlayers;
              });
            }}
          />
        );
      })}
    </Stack>
  );
};

export default PlayerList;
