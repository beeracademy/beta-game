import {
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
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getUserStats,
  type UserStatsResponse,
} from "../../../api/endpoints/stats";
import { useTextFlash } from "../../../components/TextFlash";
import { pickKillStreakMessage } from "../../../components/TextFlash/messages";
import { useAnimationFrame } from "../../../hooks/animationFrame";
import { useSounds } from "../../../hooks/sounds";
import { default as useGame } from "../../../stores/game";
import {
  useGameMetrics,
  usePlayerMetricsByIndex,
} from "../../../stores/metrics";
import { useSharedControl } from "../../../stores/sharedControl";
import { millisecondsToMMSSsss } from "../../../utilities/time";

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
  const openedRef = useRef(false);

  const chugStartDelta = card?.chug_start_start_delta_ms;
  const gameStartTimestamp = game.gameStartTimestamp;

  const calculateCurrentElapsedTime = useCallback(() => {
    if (chugStartDelta === undefined || !gameStartTimestamp) {
      return 0;
    }

    const gameStartDelta = Date.now() - gameStartTimestamp;
    return Math.max(0, gameStartDelta - chugStartDelta);
  }, [chugStartDelta, gameStartTimestamp]);

  const playOpenSound = useCallback(() => {
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

    const message = pickKillStreakMessage(playerMetrics.numberOfChugs);
    if (message) {
      textFlasher.flash(message, { variant: "kill" });
    }
  }, [playerMetrics.numberOfChugs, sounds, textFlasher]);

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
        personalBestCache.set(playerId, null);
        if (!cancelled) {
          setPersonalBest(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.open, player?.id]);

  const reset = useCallback(() => {
    if (!chugStartDelta) {
      setElapsedTime(0);
    } else {
      setElapsedTime(calculateCurrentElapsedTime());
    }

    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  }, [chugStartDelta, calculateCurrentElapsedTime]);

  useEffect(() => {
    if (!props.open) {
      openedRef.current = false;
      sounds.stop("bubbi_fuve");
      return;
    }

    if (!openedRef.current) {
      openedRef.current = true;
      reset();

      // Only play open announcement if the chug hasn't already started
      if (!chugStartDelta) {
        playOpenSound();
      }

      // If on remote and dialog is open (e.g. reload or fresh connect during chug),
      // request chug start time sync once
      if (isRemote) {
        sendRemote({ event: "GET_CHUG_TIME" });
      }
    }
  }, [
    props.open,
    isRemote,
    chugStartDelta,
    playOpenSound,
    reset,
    sendRemote,
    sounds,
  ]);

  useAnimationFrame(started && props.open, () => {
    setElapsedTime(calculateCurrentElapsedTime());
  });

  useEffect(() => {
    if (!started) {
      sounds.stop("bubbi_fuve");
    } else {
      sounds.play("bubbi_fuve");
    }

    return () => {
      sounds.stop("bubbi_fuve");
    };
  }, [started, sounds]);

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

  // Target duration from Season PB, or previous chug in this game
  const target = (() => {
    if (personalBest !== null) {
      return {
        durationMs: personalBest.durationMs,
        seasonNumber: personalBest.seasonNumber,
      };
    }

    // Fallback: check if player has any completed chug in this game
    let bestGameChug: number | null = null;
    game.draws.forEach((draw, i) => {
      const pIdx = i % (game.players.length || 1);
      if (
        pIdx === metrics.activePlayerIndex &&
        draw.value === 14 &&
        draw.chug_start_start_delta_ms !== undefined &&
        draw.chug_end_start_delta_ms !== undefined
      ) {
        const duration =
          draw.chug_end_start_delta_ms - draw.chug_start_start_delta_ms;
        if (bestGameChug === null || duration < bestGameChug) {
          bestGameChug = duration;
        }
      }
    });

    if (bestGameChug !== null) {
      return {
        durationMs: bestGameChug,
        seasonNumber: 0,
      };
    }

    return null;
  })();

  const isAhead = target !== null ? elapsedTime < target.durationMs : true;

  return (
    <Dialog
      {...props}
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
      onClose={() => {
        buttonRef.current?.focus();
      }}
      onClick={() => {
        buttonRef.current?.focus();
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 1, pb: 4 }}>
        Chug time!
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          py: { xs: 2, sm: 3.5 },
        }}
      >
        <Stack
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
              lineHeight: 1,
              fontWeight: 600,
              [theme.breakpoints.down("sm")]: {
                fontSize: 24,
              },
            }}
          >
            {player?.username || ""}
          </Typography>

          <Typography
            data-testid="chug-timer"
            sx={{
              fontSize: 100,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              [theme.breakpoints.down("sm")]: {
                fontSize: 66,
              },
            }}
          >
            {millisecondsToMMSSsss(elapsedTime)}
          </Typography>

          {target !== null && (
            <Typography
              data-testid="chug-split-text"
              sx={{
                color:
                  !started && elapsedTime === 0
                    ? "text.secondary"
                    : isAhead
                      ? theme.palette.mode === "dark"
                        ? "rgba(129, 199, 132, 0.85)"
                        : "rgba(46, 125, 50, 0.85)"
                      : theme.palette.mode === "dark"
                        ? "rgba(229, 115, 115, 0.85)"
                        : "rgba(211, 47, 47, 0.85)",
                transition: "color 150ms ease",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {!started && elapsedTime === 0
                ? target.seasonNumber > 0
                  ? `Personal best ${millisecondsToMMSSsss(target.durationMs)} from season ${target.seasonNumber}`
                  : `Personal best ${millisecondsToMMSSsss(target.durationMs)}`
                : isAhead
                  ? `-${millisecondsToMMSSsss(target.durationMs - elapsedTime)} on personal best`
                  : `+${millisecondsToMMSSsss(elapsedTime - target.durationMs)} on personal best`}
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
  );
};

export default ChugDialog;
