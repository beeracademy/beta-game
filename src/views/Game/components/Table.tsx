import {
  Box,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";

interface GameTableProps {}

const GameTable: FunctionComponent<GameTableProps> = () => {
  const theme = useTheme();

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
        height: "100%",
      }}
    >
      <Table
        size="small"
        sx={{
          height: "100%",

          "& td, & th": {
            textAlign: "center",
          },
          "& tr:last-child td": {
            borderBottom: 0,
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              display: "flex",
              height: "calc(100%/14)",
            }}
          >
            <TableCell
              sx={{
                width: 80,

                padding: 0,
                height: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Round
            </TableCell>

            {game.players.map((player, i) => {
              const isActive =
                gameMetrics.activePlayerIndex === i && !gameMetrics.done;

              return (
                <TableCell
                  key={i}
                  width={2}
                  sx={{
                    color: isActive ? "primary.main" : "text.primary",

                    fontWeight: isActive ? "bold" : "normal",

                    padding: 0,
                    height: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",

                    width: `calc((100% - 48px) / ${gameMetrics.numberOfPlayers})`,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                      marginRight: 12,
                    }}
                  >
                    {player.username}
                  </span>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {new Array(game.numberOfRounds).fill(0).map((_, i) => (
            <TableRow
              key={i + 1}
              sx={{ display: "flex", height: "calc(100%/14)" }}
            >
              <TableCell
                key={0}
                sx={{
                  color:
                    gameMetrics.currentRound === i + 1
                      ? "primary.main"
                      : "text.primary",
                  fontWeight:
                    gameMetrics.currentRound === i + 1 ? "bold" : "normal",

                  padding: 0,
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",

                  width: 80,
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
                      backgroundColor:
                        gameMetrics.activePlayerIndex === j && !gameMetrics.done
                          ? alpha("#666", 0.1)
                          : "transparent",

                      padding: 0,
                      height: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",

                      width: `calc((100% - 48px) / ${gameMetrics.numberOfPlayers})`,
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
                        <Grow in={true}>
                          <Box sx={{ display: "flex" }}>
                            <Typography
                              color={getCardSuitColor(card, theme.palette.mode)}
                              sx={{
                                width: 25,
                              }}
                            >
                              {getCardASCIISymbol(card)}
                            </Typography>

                            <Typography
                              sx={{
                                width: 25,
                              }}
                            >
                              {card?.value}
                            </Typography>
                          </Box>
                        </Grow>
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
