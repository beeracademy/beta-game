import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import useGame from "../../../stores/game";
import { useMetrics } from "../../../stores/metrics";

interface GameOverDialogProps extends DialogProps {}

const GameOverDialog: FunctionComponent<GameOverDialogProps> = (props) => {
    const game = useGame((state) => ({
        ExitGame: state.ExitGame,
    }));

    const playerMetrics = useMetrics((state) => state.playerMetrics);
    const players = useGame((state) => state.players);

    const [firstPlayerIndex, setFirstPlayerIndex] = useState<number>(0);
    const [lastPlayerIndex, setLastPlayerIndex] = useState<number>(0);

    useEffect(() => {
        const plauersSortedBySips = players
            .map((player, index) => ({
                ...player,
                sips: playerMetrics[index].totalSips,
                index,
            }))
            .sort((a, b) => b.sips - a.sips);

        setFirstPlayerIndex(plauersSortedBySips[0].index);
        setLastPlayerIndex(plauersSortedBySips[plauersSortedBySips.length - 1].index);
    }, [players, playerMetrics]);

    return (
        <Dialog {...props}>
            <DialogTitle textAlign="center">
                <Typography variant="h4">Game Over</Typography>
            </DialogTitle>

            <DialogContent
                sx={{
                    textAlign: "center",
                    minWidth: 500,
                }}
            >
                {/* Row of players in their rank order */}

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        marginTop: 2,
                        marginBottom: 2,
                    }}
                    justifyContent="space-around"
                >

                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: 2,
                }}
            >
                <Stack flex="1" spacing={1}>
                    <Button variant="contained" color="primary" fullWidth size="large">
                        Play Again
                    </Button>
                    <Button variant="outlined" fullWidth size="large" onClick={game.ExitGame}>
                        Exit
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default GameOverDialog;
