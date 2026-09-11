import {
  Avatar,
  Box,
  ButtonBase,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { type FunctionComponent, useState } from "react";
import { GiBeerBottle } from "react-icons/gi";
import { useShallow } from "zustand/react/shallow";
import Base14Sips from "../../../components/Base14Sips";
import Bubbles from "../../../components/Bubbles";
import { Crown, Jester } from "../../../components/Hats";
import {
  getCardASCIISymbol,
  getCardSuitColor,
  getCardValueSymbol,
} from "../../../models/card";
import useGame from "../../../stores/game";
import { useGameMetrics, usePlayerMetrics } from "../../../stores/metrics";
import MobilePlayerStatsDialog from "./MobilePlayerStatsDialog";

// Ranked list with inline progress bars, replacing the desktop table + graph
// combo which doesn't fit small screens.
const MobileStandings: FunctionComponent = () => {
  const theme = useTheme();

  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      dnf_player_indexes: state.dnf_player_indexes,
      sipsInABeer: state.sipsInABeer,
      draws: state.draws,
    })),
  );

  const gameMetrics = useGameMetrics();
  const playerMetrics = usePlayerMetrics();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Keeps showing the previous player while the dialog's close transition
  // plays out, instead of snapping to a fallback index.
  const [displayedIndex, setDisplayedIndex] = useState(0);

  const playerColors = theme.player as Record<number, string>;

  const isFirstRound = gameMetrics.currentRound === 1;

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      {game.players.map((player, index) => {
        const metrics = playerMetrics[index];
        const isDNF = game.dnf_player_indexes.includes(index);
        const isActive =
          gameMetrics.activePlayerIndex === index && !gameMetrics.done;
        const totalSips = metrics?.totalSips || 0;
        const color = playerColors[index] ?? playerColors[0];
        const sipsIntoBeer = totalSips % game.sipsInABeer;
        const sipsLeft = game.sipsInABeer - sipsIntoBeer;
        const numberOfPlayers = game.players.length;
        // A player's cards live at index, index + n, index + 2n, ... in the
        // draw order, so the last one drawn is the highest such index present.
        const playerDrawCount =
          numberOfPlayers > 0
            ? Math.floor((game.draws.length - 1 - index) / numberOfPlayers) + 1
            : 0;
        const lastCard =
          playerDrawCount > 0
            ? game.draws[(playerDrawCount - 1) * numberOfPlayers + index]
            : undefined;

        return (
          <ButtonBase
            key={index}
            onClick={() => {
              setSelectedIndex(index);
              setDisplayedIndex(index);
            }}
            sx={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: 1.5,
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
              backgroundColor: isActive ? color : "transparent",
              opacity: isDNF ? 0.5 : 1,
              textAlign: "left",
              justifyContent: "flex-start",
            }}
          >
            {isActive && (
              <>
                {/* Darkens the player color so the bubbles stand out on light colors */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.35,
                    zIndex: 0,
                  }}
                >
                  <Bubbles />
                </Box>
              </>
            )}

            <Box sx={{ position: "relative" }}>
              <Avatar
                src={isDNF ? undefined : player.image}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  bgcolor: isActive ? "rgba(255, 255, 255, 0.25)" : color,
                  width: 40,
                  height: 40,
                  fontSize: 15,
                  fontWeight: 700,
                  "& .MuiAvatar-fallback": { opacity: 0.5 },
                }}
              >
                {isDNF && (
                  <Box
                    component="img"
                    src="/skull.svg"
                    alt="DNF"
                    sx={{ width: "65%" }}
                  />
                )}
              </Avatar>

              {isActive && gameMetrics.chugging && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color,
                    border: (t) => `2px solid ${t.palette.background.paper}`,
                    color: "#fff",
                  }}
                >
                  <GiBeerBottle size={12} />
                </Box>
              )}
            </Box>

            <Box sx={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 15,
                    color: isActive ? "#fff" : "text.primary",
                    flex: "1 1 auto",
                    minWidth: 0,
                  }}
                >
                  {player.username}
                </Typography>

                {/* Never shrunk, so hats/chug count stay visible when the name is truncated */}
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", gap: 0.5, flexShrink: 0 }}
                >
                  {!isFirstRound && metrics?.isLeading && (
                    <Crown
                      style={{
                        height: 11,
                        display: "block",
                        flexShrink: 0,
                        marginLeft: 2,
                        marginRight: 2,
                      }}
                    />
                  )}
                  {!isFirstRound && metrics?.isLast && (
                    <Jester
                      style={{
                        height: 11,
                        display: "block",
                        flexShrink: 0,
                        marginLeft: 2,
                        marginRight: 2,
                      }}
                    />
                  )}

                  {!!metrics?.numberOfChugs && (
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        gap: 0.25,
                        flexShrink: 0,
                        color: isActive ? "#fff" : "text.secondary",
                      }}
                    >
                      <GiBeerBottle size={13} />
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "inherit",
                        }}
                      >
                        ×{metrics.numberOfChugs}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>

              <Typography
                sx={{ fontSize: 11 }}
                color={
                  isActive ? "rgba(255, 255, 255, 0.85)" : "text.secondary"
                }
              >
                {isDNF ? (
                  "DNF"
                ) : (
                  <>
                    {sipsLeft} sip{sipsLeft === 1 ? "" : "s"} left in beer{" "}
                    {(metrics?.numberOfBeers ?? 0) + 1}
                    {lastCard && (
                      <>
                        {", latest draw "}
                        <Box
                          component="span"
                          sx={{
                            color: isActive
                              ? "inherit"
                              : getCardSuitColor(lastCard, theme.palette.mode),
                          }}
                        >
                          {getCardASCIISymbol(lastCard)}
                        </Box>{" "}
                        {getCardValueSymbol(lastCard.value)}
                      </>
                    )}
                  </>
                )}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={(sipsIntoBeer / game.sipsInABeer) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  marginTop: 0.75,
                  backgroundColor: isActive
                    ? "rgba(255, 255, 255, 0.25)"
                    : "action.selected",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: isActive ? "#fff" : color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Typography
              sx={{
                position: "relative",
                zIndex: 1,
                fontWeight: 700,
                fontSize: 18,
                minWidth: 36,
                textAlign: "right",
                color: isActive ? "#fff" : "text.primary",
              }}
            >
              <Base14Sips value={totalSips} denotationOpacity={0.6} />
            </Typography>
          </ButtonBase>
        );
      })}

      <MobilePlayerStatsDialog
        open={selectedIndex !== null}
        index={displayedIndex}
        onClose={() => setSelectedIndex(null)}
      />
    </Stack>
  );
};

export default MobileStandings;
