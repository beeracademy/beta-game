import { Stack } from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import PlayerItem from "./PlayerItem";

const PlayerList: FunctionComponent = () => {
  const game = useGame((state) => ({
    players: state.players,
  }));

  const gameMetrics = useGameMetrics();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        marginTop: 5,
      }}
    >
      {game.players.map((p, i) => (
        <PlayerItem
          key={i}
          player={p}
          index={i}
          active={gameMetrics.activePlayerIndex === i && !gameMetrics.done}
        />
      ))}
    </Stack>
  );
};

export default PlayerList;
