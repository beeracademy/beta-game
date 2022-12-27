import {
    alpha,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { FunctionComponent } from "react";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";

interface GameTableProps {}

const GameTable: FunctionComponent<GameTableProps> = () => {
    const game = useGame((state) => ({
        cards: state.cards,
        players: state.players,
        playerCount: state.playerCount,
        totalRoundCount: state.totalRoundCount,
        roundCount: state.roundCount,
        activePlayerIndex: state.activePlayerIndex,
        done: state.done,
    }));

    return (
        <TableContainer
            sx={{
                flex: 1,
            }}
        >
            <Table
                size="small"
                sx={{
                    "& td, & th": {
                        textAlign: "center",
                    },
                    "& tr:last-child td": {
                        borderBottom: 0,
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Round</TableCell>
                        {game.players.map((player, i) => (
                            <TableCell
                                key={i}
                                sx={{
                                    color: game.activePlayerIndex === i && !game.done ? "primary.main" : "text.primary",
                                }}
                            >
                                {player.username}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {new Array(game.totalRoundCount).fill(0).map((_, i) => (
                        <TableRow key={i + 1}>
                            <TableCell
                                key={0}
                                sx={{
                                    color: game.roundCount === i + 1 ? "primary.main" : "text.primary",
                                }}
                            >
                                {i + 1}
                            </TableCell>

                            {new Array(game.playerCount).fill(0).map((_, j) => {
                                const card = game.cards[i * game.playerCount + j];

                                return (
                                    <TableCell
                                        key={j + 1}
                                        sx={{
                                            padding: 0,
                                            height: 20,
                                            backgroundColor:
                                                game.activePlayerIndex === j && !game.done
                                                    ? alpha("#666", 0.1)
                                                    : "transparent",
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="space-between"
                                            sx={{
                                                margin: "auto",
                                                maxWidth: 50,
                                            }}
                                        >
                                            {card && (
                                                <>
                                                    <Typography
                                                        color={getCardSuitColor(card)}
                                                        sx={{
                                                            width: 25,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {getCardASCIISymbol(card)}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            width: 25,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {card?.value}
                                                    </Typography>
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameTable;
