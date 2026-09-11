import {
  Avatar,
  Badge,
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { IoListOutline, IoPlay, IoShuffle } from "react-icons/io5";
import { useSounds } from "../../../../hooks/sounds";
import type { Player } from "../../../../models/player";
import { swap } from "../../../../utilities/array";
import { randInt } from "../../../../utilities/random";
import { useNewGame } from "../contexts/newGame";

interface PreGameScreenProps {
  players: Player[];
  onStart: (players: Player[]) => void;
}

type Phase = "choose" | "shuffling" | "shuffled";

const SHUFFLE_STEPS = 12;
const SHUFFLE_STEP_BASE_DELAY = 90;
const SHUFFLE_STEP_DELAY_INCREMENT = 20;

// Fisher-Yates shuffle of an index order (not the actual player list)
const shuffleOrder = (order: number[]): number[] => {
  const shuffled = [...order];

  for (let i = shuffled.length - 1; i >= 1; i--) {
    swap(shuffled, i, randInt(0, i));
  }

  return shuffled;
};

const PreGameScreen: FunctionComponent<PreGameScreenProps> = ({
  players,
  onStart,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { play, stop } = useSounds();
  const newGame = useNewGame();

  const [order, setOrder] = useState<number[]>(players.map((_, i) => i));
  const [phase, setPhase] = useState<Phase>("choose");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const shuffle = () => {
    if (phase !== "choose") {
      return;
    }

    setPhase("shuffling");

    play("slot_machine");

    let step = 0;

    const runStep = () => {
      step++;

      setOrder((prev) => {
        const next = shuffleOrder(prev);

        if (step >= SHUFFLE_STEPS) {
          stop("slot_machine");
          play("slot_machine_winner");
          setPhase("shuffled");
          newGame.setTitle("Player order shuffled!");
        } else {
          timeoutRef.current = setTimeout(
            runStep,
            SHUFFLE_STEP_BASE_DELAY + step * SHUFFLE_STEP_DELAY_INCREMENT,
          );
        }

        return next;
      });
    };

    timeoutRef.current = setTimeout(runStep, SHUFFLE_STEP_BASE_DELAY);
  };

  const keepOrder = () => {
    if (phase !== "choose") {
      return;
    }

    onStart(players);
  };

  const beginGame = () => {
    onStart(order.map((i) => players[i]));
  };

  const orderedPlayers = order.map((i) => players[i]);

  return (
    <Stack spacing={2} sx={{ height: isMobile ? "100%" : "auto" }}>
      <Box
        sx={{
          flex: isMobile ? 1 : "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: isMobile ? "flex-start" : "center",
          overflowY: isMobile ? "auto" : "visible",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: isMobile ? "nowrap" : "wrap",
            justifyContent: isMobile ? "flex-start" : "center",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 1 : 3,
            py: 2,
          }}
        >
          {orderedPlayers.map((player, i) => (
            <motion.div
              key={player.id ?? player.username ?? i}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{ display: "flex", width: isMobile ? "100%" : undefined }}
            >
              {isMobile ? (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: "center",
                    width: "100%",
                    py: 1.25,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: (t) =>
                      `2px solid ${t.player[(i % 6) as keyof typeof t.player]}`,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={i + 1}
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        border: (t) =>
                          `2px solid ${t.palette.background.paper}`,
                        outline: (t) => `1px solid ${t.palette.divider}`,
                        fontSize: 11,
                        fontWeight: 700,
                        minWidth: 20,
                        height: 20,
                      },
                    }}
                  >
                    <Avatar
                      src={player.image}
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        "& .MuiAvatar-fallback": { opacity: 0.5 },
                        ...(!player.image && {
                          bgcolor: (t) =>
                            t.player[(i % 6) as keyof typeof t.player],
                        }),
                      }}
                    />
                  </Badge>

                  <Typography
                    variant="body1"
                    noWrap
                    sx={{ flex: 1, fontWeight: 500 }}
                  >
                    {player.username}
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                  <Avatar
                    src={player.image}
                    sx={{
                      width: 80,
                      height: 80,
                      "& .MuiAvatar-fallback": { opacity: 0.5 },
                      ...(!player.image && {
                        bgcolor: (t) =>
                          t.player[(i % 6) as keyof typeof t.player],
                      }),
                    }}
                  />

                  <Stack spacing={0} sx={{ alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ maxWidth: 90, fontWeight: 500 }}
                    >
                      {player.username}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      #{i + 1}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </motion.div>
          ))}
        </Box>
      </Box>

      <Stack
        spacing={1}
        direction={isMobile ? "column" : "row"}
        sx={{ mt: "auto" }}
      >
        {phase === "shuffled" ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            endIcon={<IoPlay size={20} />}
            onClick={beginGame}
          >
            Start game
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<IoShuffle size={20} />}
              onClick={shuffle}
              disabled={phase === "shuffling"}
            >
              {phase === "shuffling" ? "Shuffling..." : "Shuffle 'em!"}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              fullWidth
              startIcon={<IoListOutline size={20} />}
              onClick={keepOrder}
              disabled={phase === "shuffling"}
            >
              Keep order
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default PreGameScreen;
