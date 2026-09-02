import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSounds } from "../../../../hooks/sounds";
import type { Player } from "../../../../models/player";
import { swap } from "../../../../utilities/array";
import { randInt } from "../../../../utilities/random";

interface ShuffleDialogProps {
  open: boolean;
  players: Player[];
  onCancel: () => void;
  onStart: (players: Player[]) => void;
}

const SHUFFLE_STEPS = 12;
const SHUFFLE_STEP_BASE_DELAY = 90;
const SHUFFLE_STEP_DELAY_INCREMENT = 20;
const SHUFFLE_SETTLE_DELAY = 600;

// Fisher-Yates shuffle of an index order (not the actual player list)
const shuffleOrder = (order: number[]): number[] => {
  const shuffled = [...order];

  for (let i = shuffled.length - 1; i >= 1; i--) {
    swap(shuffled, i, randInt(0, i));
  }

  return shuffled;
};

const ShuffleDialog: FunctionComponent<ShuffleDialogProps> = ({
  open,
  players,
  onCancel,
  onStart,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { play, stopAll } = useSounds();

  const [order, setOrder] = useState<number[]>(players.map((_, i) => i));
  const [shuffling, setShuffling] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const startedRef = useRef(false);

  // Reset local state whenever the pre-game screen is (re)opened
  useEffect(() => {
    if (open) {
      setOrder(players.map((_, i) => i));
      setShuffling(false);
      setHasShuffled(false);
      startedRef.current = false;
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const proceed = (finalOrder: number[]) => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    clearTimeout(timeoutRef.current);
    onStart(finalOrder.map((i) => players[i]));
  };

  const shuffle = () => {
    if (hasShuffled || shuffling) {
      return;
    }

    setShuffling(true);
    setHasShuffled(true);

    play("slot_machine");

    let step = 0;

    const runStep = () => {
      step++;

      setOrder((prev) => {
        const next = shuffleOrder(prev);

        if (step >= SHUFFLE_STEPS) {
          setShuffling(false);
          stopAll();
          play("slot_machine_winner");

          timeoutRef.current = setTimeout(
            () => proceed(next),
            SHUFFLE_SETTLE_DELAY,
          );
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

  const orderedPlayers = order.map((i) => players[i]);

  return (
    <Dialog
      open={open}
      onClose={shuffling ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <IconButton
        aria-label="Close"
        onClick={onCancel}
        disabled={shuffling}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <IoClose size={20} />
      </IconButton>

      <DialogTitle
        sx={{ textAlign: "center", fontSize: { xs: 20, sm: 24 }, pr: 5 }}
      >
        Shuffle player order?
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: isMobile ? 1 : "none",
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={isMobile ? 1 : 2}
          sx={{
            justifyContent: "center",
            alignItems: isMobile ? "stretch" : "center",
            flexWrap: "wrap",
            py: 2,
          }}
        >
          {orderedPlayers.map((player, i) => (
            <Stack
              key={player.id ?? player.username ?? i}
              direction={isMobile ? "row" : "column"}
              spacing={1.5}
              sx={{
                alignItems: "center",
                width: isMobile ? "100%" : 90,
                transition: "transform 150ms ease",
              }}
            >
              <Avatar
                src={player.image}
                sx={{
                  width: isMobile ? 48 : 80,
                  height: isMobile ? 48 : 80,
                  fontSize: isMobile ? 18 : 28,
                  bgcolor: (t) => t.player[(i % 6) as keyof typeof t.player],
                }}
              >
                {player.username?.[0]?.toUpperCase()}
              </Avatar>

              <Typography
                variant="body2"
                noWrap
                sx={{
                  maxWidth: isMobile ? "none" : 90,
                  textAlign: isMobile ? "left" : "center",
                }}
              >
                {player.username}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ flexDirection: isMobile ? "column" : "row" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={shuffle}
          disabled={hasShuffled || shuffling}
        >
          {shuffling ? "Shuffling..." : "Shuffle 'em!"}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="large"
          fullWidth
          onClick={() => proceed(order)}
          disabled={shuffling}
        >
          {hasShuffled ? "Continue" : "Keep order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShuffleDialog;
