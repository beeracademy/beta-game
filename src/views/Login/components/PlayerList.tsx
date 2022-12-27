import { Box, Stack } from "@mui/material";
import { FunctionComponent } from "react";
import PlayerItem from "./PlayerItem";

interface PlayerListProps {
    numberOfPlayers: number;
    offline?: boolean;
}

const PlayerList: FunctionComponent<PlayerListProps> = (props) => {
    return (
        <Stack spacing={1}>
            {Array.from(Array(props.numberOfPlayers).keys()).map((_, i) => {
                return <PlayerItem key={i} hidePassword={props.offline} />;
            })}
        </Stack>
    );
};

export default PlayerList;
