import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { detect } from "detect-browser";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  getUserStats,
  type UserStatsResponse,
} from "../../../api/endpoints/stats";
import { useTextFlash } from "../../../components/TextFlash";
import { pickKillStreakMessage } from "../../../components/TextFlash/messages";
import { useSounds } from "../../../hooks/sounds";
import { default as useGame } from "../../../stores/game";
import { useSharedControl } from "../../../stores/sharedControl";
import {
  useGameMetrics,
  usePlayerMetricsByIndex,
} from "../../../stores/metrics";
import { millisecondsToMMSSsss } from "../../../utilities/time";

const browser = detect();

interface PersonalBest {
  durationMs: number;
  seasonNumber: number;
}

// Module-level cache so we don't refetch a player's personal best every time the dialog reopens
const personalBestCache = new Map<number, PersonalBest | null>();

// season_number: 0 is an all-time aggregate entry, not an actual season
function findPersonalBest(stats: UserStatsResponse[]): PersonalBest | null {
  let best: PersonalBest | null = null;

  for (const entry of stats) {
    if (
      entry.season_number === 0 ||
      entry.fastest_chug_duration_ms === undefined ||
      entry.fastest_chug_duration_ms === null
    ) {
      continue;
    }

    if (best === null || entry.fastest_chug_duration_ms < best.durationMs) {
      best = {
        durationMs: entry.fastest_chug_duration_ms,
        seasonNumber: entry.season_number,
      };
    }
  }

  return best;
}

interface ChugDialogProps extends DialogProps {}

const ChugDialog: FunctionComponent<ChugDialogProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sounds = useSounds();
  const textFlasher = useTextFlash();
  const { width, height } = useWindowSize();

  const game = useGame();
  const { isRemote, send: sendRemote } = useSharedControl();
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
  const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);

  useEffect(() => {
    const playerId = player?.id;

    if (!props.open || playerId === undefined) {
      return;
    }

    const cached = personalBestCache.get(playerId);
    if (cached !== undefined) {
      setPersonalBest(cached);
      return;
    }

    let cancelled = false;
    getUserStats(playerId)
      .then((stats) => {
        const best = findPersonalBest(stats);
        personalBestCache.set(playerId, best);
        if (!cancelled) {
          setPersonalBest(best);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPersonalBest(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.open, player?.id]);

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

      // If on remote and dialog is open (e.g. reload or fresh connect during chug),
      // request chug start time sync once
      if (isRemote) {
        sendRemote({ event: "GET_CHUG_TIME" });
      }
    }
  }, [props.open, isRemote]);

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

    if (isRemote) {
      sendRemote({ event: "START_CHUG" });
      return;
    }

    game.StartChug();
  };

  const stop = () => {
    if (!started) {
      return;
    }

    if (isRemote) {
      sendRemote({ event: "STOP_CHUG" });
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

    {
      const message = pickKillStreakMessage(playerMetrics.numberOfChugs);
      if (message) {
        textFlasher.flash(message, { variant: "kill" });
      }
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
        fullScreen={isMobile}
        maxWidth="xs"
        onClose={() => {
          buttonRef.current?.focus();
        }}
        onClick={() => {
          buttonRef.current?.focus();
        }}
      >
        <DialogTitle>Chug time!</DialogTitle>

        <DialogContent
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
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
                fontSize: 34,
                fontWeight: 600,
                [theme.breakpoints.down("sm")]: {
                  fontSize: 24,
                },
              }}
            >
              {player?.username || ""}
            </Typography>

            <Typography
              sx={{
                fontSize: 88,
                fontWeight: 700,
                [theme.breakpoints.down("sm")]: {
                  fontSize: 64,
                },
              }}
            >
              {millisecondsToMMSSsss(elapsedTime)}
            </Typography>

            {personalBest !== null && (
              <Typography color="text.secondary">
                Personal best {millisecondsToMMSSsss(personalBest.durationMs)}{" "}
                from season {personalBest.seasonNumber}
              </Typography>
            )}
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

                if (started) {
                  stop();
                } else {
                  start();
                }
              }
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (started) {
                stop();
              } else {
                start();
              }
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
