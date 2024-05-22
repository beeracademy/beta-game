import {
  alpha,
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
import { useGameMetrics } from "../../../stores/metrics";

interface GameTableProps {}

const GameTable: FunctionComponent<GameTableProps> = () => {
  const game = useGame((state) => ({
    players: state.players,
    numberOfRounds: state.numberOfRounds,
    draws: state.draws,
  }));

  const gameMetrics = useGameMetrics();

  return (
    <TableContainer
      sx={{
        flex: 1,
        userSelect: "none",
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
            <TableCell width={48}>Round</TableCell>
            {game.players.map((player, i) => {
              const isActive =
                gameMetrics.activePlayerIndex === i && !gameMetrics.done;

              return (
                <TableCell
                  key={i}
                  sx={{
                    color: isActive ? "primary.main" : "text.primary",

                    fontWeight: isActive ? "bold" : "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {player.username}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {new Array(game.numberOfRounds).fill(0).map((_, i) => (
            <TableRow key={i + 1}>
              <TableCell
                key={0}
                sx={{
                  color:
                    gameMetrics.currentRound === i + 1
                      ? "primary.main"
                      : "text.primary",
                  fontWeight:
                    gameMetrics.currentRound === i + 1 ? "bold" : "normal",
                }}
              >
                {i + 1}
              </TableCell>

              {new Array(gameMetrics.numberOfPlayers).fill(0).map((_, j) => {
                const card = game.draws[i * gameMetrics.numberOfPlayers + j];

                return (
                  <TableCell
                    key={j + 1}
                    sx={{
                      padding: 0,
                      height: 20,
                      backgroundColor:
                        gameMetrics.activePlayerIndex === j && !gameMetrics.done
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
                        maxWidth: 40,
                      }}
                    >
                      {card && (
                        <>
                          <Typography
                            color={getCardSuitColor(card)}
                            sx={{
                              width: 25,
                              textAlign: "left",
                            }}
                          >
                            {getCardASCIISymbol(card)}
                          </Typography>

                          <Typography
                            sx={{
                              width: 25,
                              textAlign: "right",
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
