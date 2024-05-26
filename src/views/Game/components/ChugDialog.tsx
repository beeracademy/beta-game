import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
} from "@mui/material";
import { detect } from "detect-browser";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { useSounds } from "../../../hooks/sounds";
import { default as useGame } from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import { milisecondsToMMSSsss } from "../../../utilities/time";

const browser = detect();

interface ChugDialogProps extends DialogProps {}

const ChugDialog: FunctionComponent<ChugDialogProps> = (props) => {
  const sounds = useSounds();

  const game = useGame();
  const metrics = useGameMetrics();

  const player = game.players[metrics.activePlayerIndex];
  const card = metrics.latestCard;
  const started = metrics.chugging && card?.chug_start_start_delta_ms;

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [elapsedTime, setElapsedTime] = useState(0);

  const [intervalRef, setIntervalRef] =
    useState<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!started) {
      clearInterval(intervalRef);
      setIntervalRef(undefined);

      sounds.stop("bubbi_fuve");
    } else {
      if (!intervalRef) {
        clearInterval(intervalRef);
      }

      const interval = setInterval(updateElapsedTime, 1);
      setIntervalRef(interval);

      sounds.play("bubbi_fuve");
    }
  }, [started]);

  const updateElapsedTime = () => {
    if (!card?.chug_start_start_delta_ms) {
      return;
    }

    const gameStartDelta = Date.now() - game.gameStartTimestamp;
    const duration = gameStartDelta - card.chug_start_start_delta_ms;

    setElapsedTime(duration);
  };

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
    setElapsedTime(0);

    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  const playFinishSound = () => {
    if (elapsedTime < 5000) {
      //   this.flashService.flashText("FlAWLESS VICTORY!");
      sounds.play("mkd_flawless");
    } else if (elapsedTime < 7000) {
      //   this.flashService.flashText("FATALITY!");
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
    }
  }, [props.open]);

  return (
    <>
      {/* 
        Firefox lags with confetti, don't know why, so we disable it for now
      */}
      {props.open && browser?.name !== "firefox" && <ReactConfetti />}

      <Dialog
        {...props}
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
            alignItems={"center"}
            sx={{
              width: "100%",
            }}
          >
            <Typography
              fontSize={36}
              sx={{
                width: 400,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {player.username}
            </Typography>

            <Typography fontSize={100}>
              {milisecondsToMMSSsss(elapsedTime)}
            </Typography>

            <Typography fontSize={24} color="text.secondary">
              {/* TODO: implement */}
              best {milisecondsToMMSSsss(199923)} from season 10
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 2,
          }}
        >
          <Button
            disableRipple
            ref={buttonRef}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              height: 64,
              fontSize: 32,
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
