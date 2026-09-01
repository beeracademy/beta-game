import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { detect } from "detect-browser";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useSounds } from "../../../hooks/sounds";
import { default as useGame } from "../../../stores/game";
import {
  useGameMetrics,
  usePlayerMetricsByIndex,
} from "../../../stores/metrics";
import { milisecondsToMMSSsss } from "../../../utilities/time";

const browser = detect();

interface ChugDialogProps extends DialogProps {}

const ChugDialog: FunctionComponent<ChugDialogProps> = (props) => {
  const theme = useTheme();
  const sounds = useSounds();
  const { width, height } = useWindowSize();

  const game = useGame();
  const metrics = useGameMetrics();
  const playerMetrics = usePlayerMetricsByIndex(metrics.activePlayerIndex);

  const player = game.players[metrics.activePlayerIndex];

  const card = metrics.latestCard;
  const started = Boolean(
    metrics.chugging &&
    card?.chug_start_start_delta_ms !== undefined &&
    card?.chug_end_start_delta_ms === undefined,
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const openedRef = useRef(false);

  const calculateCurrentElapsedTime = () => {
    if (
      card?.chug_start_start_delta_ms === undefined ||
      !game.gameStartTimestamp
    ) {
      return 0;
    }

    const gameStartDelta = Date.now() - game.gameStartTimestamp;
    return Math.max(0, gameStartDelta - card.chug_start_start_delta_ms);
  };

  const [elapsedTime, setElapsedTime] = useState<number>(() =>
    calculateCurrentElapsedTime(),
  );

  useEffect(() => {
    if (!props.open) {
      openedRef.current = false;
      return;
    }

    if (!openedRef.current) {
      openedRef.current = true;
      // Only play open announcement if the chug hasn't already started
      if (!card?.chug_start_start_delta_ms) {
        playOpenSound();
      }
    }
  }, [props.open]);

  const updateElapsedTime = () => {
    setElapsedTime(calculateCurrentElapsedTime());
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!started) {
      sounds.stop("bubbi_fuve");
    } else {
      updateElapsedTime();
      intervalRef.current = setInterval(updateElapsedTime, 10);
      sounds.play("bubbi_fuve");
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sounds.stop("bubbi_fuve");
    };
  }, [started, card?.chug_start_start_delta_ms, game.gameStartTimestamp]);

  const start = () => {
    if (started) {
      return;
    }

    game.StartChug();
  };

  const stop = () => {
    if (!started) {
      return;
    }

    game.StopChug();

    playFinishSound();
  };

  const reset = () => {
    if (!card?.chug_start_start_delta_ms) {
      setElapsedTime(0);
    } else {
      updateElapsedTime();
    }

    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  const playOpenSound = () => {
    switch (playerMetrics.numberOfChugs) {
      case 1:
        sounds.play("mkd_finishim");
        break;
      case 2:
        sounds.play("doublekill");
        break;
      case 3:
        sounds.play("triplekill");
        break;
      case 4:
        sounds.play("ultrakill");
        break;
      case 5:
        sounds.play("megakill");
        break;
      case 6:
        sounds.play("monsterkill");
        break;
      default:
        break;
    }
  };

  const playFinishSound = () => {
    if (elapsedTime < 5000) {
      sounds.play("mkd_flawless");
    } else if (elapsedTime < 7000) {
      sounds.play("mkd_fatality");
    } else if (elapsedTime < 20000) {
      sounds.play("mkd_laugh");
    } else {
      sounds.play("humiliation");
    }
  };

  useEffect(() => {
    if (props.open) {
      reset();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sounds.stop("bubbi_fuve");
    }
  }, [props.open]);

  return (
    <>
      {/* 
        Firefox lags with confetti, don't know why, so we disable it for now
      */}
      {props.open && browser?.name !== "firefox" && (
        <Box
          sx={{
            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <ReactConfetti width={width} height={height} />
        </Box>
      )}

      <Dialog
        {...props}
        fullWidth
        maxWidth="xs"
        onClose={() => {
          buttonRef.current?.focus();
        }}
        onClick={() => {
          buttonRef.current?.focus();
        }}
      >
        <DialogContent
          sx={{
            textAlign: "center",
          }}
        >
          <Stack
            spacing={1}
            sx={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontSize: 26,
                [theme.breakpoints.down("sm")]: {
                  fontSize: 18,
                },
              }}
            >
              {player?.username || ""}
            </Typography>

            <Typography
              sx={{
                fontSize: 72,
                [theme.breakpoints.down("sm")]: {
                  fontSize: 48,
                },
              }}
            >
              {milisecondsToMMSSsss(elapsedTime)}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            disableRipple
            ref={buttonRef}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              height: 52,
              fontSize: 24,
              fontWeight: "bold",
            }}
            onKeyDownCapture={(e) => {
              if (e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();

                started ? stop() : start();
              }
            }}
            onClick={(e) => {
              e.stopPropagation();

              started ? stop() : start();
            }}
          >
            {started ? "Stop" : "Start"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChugDialog;
