import { Stack } from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import PlayerItem from "./PlayerItem";

const PlayerList: FunctionComponent = () => {
  const players = useGame((state) => state.players);

  const gameMetrics = useGameMetrics();

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
      }}
    >
      {players.map((p, i) => (
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
