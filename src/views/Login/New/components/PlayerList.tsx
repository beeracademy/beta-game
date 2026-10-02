import { Stack } from "@mui/material";
import { FunctionComponent } from "react";
import { useNewGame } from "../contexts/newGame";
import PlayerItem from "./PlayerItem";

const PlayerList: FunctionComponent = () => {
  const newGame = useNewGame();

  return (
    <Stack spacing={1}>
      {newGame.players.map((_, i) => {
        return <PlayerItem key={i} index={i} />;
      })}
    </Stack>
  );
};

export default PlayerList;
