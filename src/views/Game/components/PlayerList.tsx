import { Stack } from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";
import PlayerItem from "./PlayerItem";

const PlayerList: FunctionComponent = () => {
    const game = useGame((state) => ({
        activePlayerIndex: state.activePlayerIndex,
        players: state.players,
        done: state.done,
    }));

    return (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            {game.players.map((p, i) => (
                <PlayerItem key={i} player={p} index={i} active={
                    game.activePlayerIndex === i && !game.done
                } />
            ))}
        </Stack>
    );
};

export default PlayerList;
