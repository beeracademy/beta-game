import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  type FunctionComponent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { BsMoonStarsFill } from "react-icons/bs";
import { IoLogoGameControllerB } from "react-icons/io";
import { IoDesktopOutline, IoExitOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useFullscreen, useToggle } from "react-use";
import { useShallow } from "zustand/react/shallow";
import { ChatToggleButton } from "../../../components/GameChat";
import { useAnimationFrame } from "../../../hooks/animationFrame";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import useSettings, {
  getNextThemeMode,
  type ThemeMode,
} from "../../../stores/settings";
import { useSharedControl } from "../../../stores/sharedControl";
import {
  formatCardRate,
  formatRoundRate,
  secondsToHHMMSS,
  secondsToHHMMSSsss,
} from "../../../utilities/time";
import DNFDialog from "./DNFDialog";
import ExitGameDialog from "./ExitGameDialog";
import SharedControlDialog from "./SharedControlDialog";

/**
 * Updates the text of an element in place. Reusing the existing text node
 * avoids tearing down and recreating one on every animation frame.
 */
const setTextContent = (element: HTMLElement | null, value: string) => {
  if (!element) {
    return;
  }

  const node = element.firstChild;

  if (node && node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue !== value) {
      node.nodeValue = value;
    }

    return;
  }

  element.textContent = value;
};

const Header: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [fullscreen, toggleFullscreen] = useToggle(false);
  const isFullscreen = useFullscreen(
    useRef(document.documentElement),
    fullscreen,
    {
      onClose: () => toggleFullscreen(false),
    },
  );

  const sound = useSounds();

  const game = useGame(
    useShallow((state) => ({
      gameStartTimestamp: state.gameStartTimestamp,
      gameEndTimestamp: state.gameEndTimestamp,
      turnStartTimestamp: state.turnStartTimestamp,
      numberOfRounds: state.numberOfRounds,
      ExitGame: state.Exit,
      offline: state.offline,
    })),
  );

  const gameMetrics = useGameMetrics();

  const settings = useSettings(
    useShallow((state) => ({
      themeMode: state.themeMode,
      SetThemeMode: state.SetThemeMode,
    })),
  );

  const { isRemote } = useSharedControl();

  const [sharedControlDialogOpen, setSharedControlDialogOpen] = useState(false);
  const [exitGameDialogOpen, setExitGameDialogOpen] = useState(false);
  const [dnfDialogOpen, setDNFDialogOpen] = useState(false);

  const showExitGameDialog = () => {
    if (gameMetrics.done) {
      game.ExitGame({
        dnf: false,
      });

      return;
    }

    setExitGameDialogOpen(true);
  };

  const closeExitGameDialog = (e: { ok: boolean }) => {
    setExitGameDialogOpen(false);

    if (e.ok) {
      game.ExitGame({
        dnf: true,
      });

      navigate("/login");
    }
  };

  const turnHoursRef = useRef<HTMLElement>(null);
  const turnMinutesRef = useRef<HTMLElement>(null);
  const turnSecondsRef = useRef<HTMLElement>(null);
  const turnMsRef = useRef<HTMLElement>(null);
  const gameHoursRef = useRef<HTMLElement>(null);
  const gameMinutesRef = useRef<HTMLElement>(null);
  const gameSecondsRef = useRef<HTMLElement>(null);
  const avgRoundTimeRef = useRef<HTMLElement>(null);
  const avgCardTimeRef = useRef<HTMLElement>(null);

  // The clocks are written straight to the DOM instead of through state: they
  // tick every frame and re-rendering the whole header that often is wasteful.
  // The ":" separators are static spans (see .time-colon) instead of part of
  // the ticking text, since AUPassata's colon glyph needs a CSS nudge to look
  // vertically centered.
  const updateTimes = useCallback(() => {
    const [turnHours, turnMinutes, turnSecondsAndMs] = secondsToHHMMSSsss(
      gameMetrics.done ? 0 : gameMetrics.GetElapsedTurnTime(),
    ).split(":");
    setTextContent(turnHoursRef.current, turnHours);
    setTextContent(turnMinutesRef.current, turnMinutes);
    const [turnSeconds, turnMs] = turnSecondsAndMs.split(".");
    setTextContent(turnSecondsRef.current, turnSeconds);
    setTextContent(turnMsRef.current, `.${turnMs}`);

    const [gameHours, gameMinutes, gameSeconds] = secondsToHHMMSS(
      gameMetrics.GetElapsedGameTime(),
    ).split(":");
    setTextContent(gameHoursRef.current, gameHours);
    setTextContent(gameMinutesRef.current, gameMinutes);
    setTextContent(gameSecondsRef.current, gameSeconds);

    const avgRoundMs = gameMetrics.GetAverageRoundTime();
    setTextContent(
      avgRoundTimeRef.current,
      avgRoundMs > 0 ? formatRoundRate(avgRoundMs) : "-",
    );

    const avgCardMs = gameMetrics.GetAverageCardTime();
    setTextContent(
      avgCardTimeRef.current,
      avgCardMs > 0 ? formatCardRate(avgCardMs) : "-",
    );
  }, [gameMetrics]);

  useLayoutEffect(updateTimes, [updateTimes]);
  useAnimationFrame(true, updateTimes);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          padding: 1,
          paddingLeft: { xs: 1.5, sm: 2 },
          paddingRight: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "none",
          flexShrink: 0,
          display: "flex",
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            flex: 1,
            marginRight: "auto",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1.5,

            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Tooltip title="Mark players as 'Did not finish'" placement="bottom">
            <IconButton
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.04em",
                width: 38,
                height: 38,
                color: "primary.contrastText",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                transition: "transform 0.15s ease, background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(1px) scale(0.96)",
                },
              }}
              onClick={() => setDNFDialogOpen(true)}
            >
              DNF
            </IconButton>
          </Tooltip>

          {!isRemote && !game.offline && (
            <Tooltip title="Shared control settings" placement="bottom">
              <IconButton
                sx={{
                  color: "primary.contrastText",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  width: 38,
                  height: 38,
                  transition:
                    "transform 0.15s ease, background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(1px) scale(0.96)",
                  },
                }}
                onClick={() => {
                  setSharedControlDialogOpen(true);
                }}
              >
                <IoLogoGameControllerB size={20} />
              </IconButton>
            </Tooltip>
          )}

          {(() => {
            const themeTitle: Record<ThemeMode, string> = {
              system: "System",
              light: "Light",
              dark: "Dark",
            };
            const nextThemeMode = getNextThemeMode(settings.themeMode);

            return (
              <Tooltip
                title={`Theme: ${themeTitle[settings.themeMode]} (switch to ${themeTitle[nextThemeMode]})`}
                placement="bottom"
              >
                <IconButton
                  sx={{
                    color: "primary.contrastText",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    width: 38,
                    height: 38,
                    transition:
                      "transform 0.15s ease, background-color 0.15s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.18)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(1px) scale(0.96)",
                    },
                  }}
                  onClick={() => {
                    sound.play("click");
                    settings.SetThemeMode(nextThemeMode);
                  }}
                  aria-label={`Theme: ${themeTitle[settings.themeMode]}. Switch to ${themeTitle[nextThemeMode]} theme.`}
                >
                  {settings.themeMode === "system" ? (
                    <IoDesktopOutline size={18} />
                  ) : settings.themeMode === "dark" ? (
                    <BsMoonStarsFill size={17} />
                  ) : (
                    <MdWbSunny size={20} />
                  )}
                </IconButton>
              </Tooltip>
            );
          })()}
        </Box>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "center" },
            width: { xs: "100%", sm: "auto" },
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Stack
            sx={{
              textAlign: { xs: "left", sm: "center" },
              alignItems: { xs: "flex-start", sm: "center" },
              minWidth: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: 14, sm: 24 },
                fontWeight: { xs: 600, sm: "inherit" },
                lineHeight: { xs: 1.2, sm: "inherit" },
                whiteSpace: "nowrap",
              }}
            >
              Round {gameMetrics.currentRound}/{game.numberOfRounds}
            </Typography>
            <Typography
              ref={avgRoundTimeRef}
              sx={{
                fontSize: { xs: 11, sm: 13 },
                opacity: 0.8,
                mt: 0.25,
                whiteSpace: "nowrap",
              }}
            />
          </Stack>

          <Stack
            sx={{
              textAlign: "center",
              alignItems: "center",
              marginLeft: { xs: 1, sm: 6 },
              marginRight: { xs: 1, sm: 6 },
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 22, sm: 32 },
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              <span ref={turnHoursRef} />
              <span className="time-colon">:</span>
              <span ref={turnMinutesRef} />
              <span className="time-colon">:</span>
              <span ref={turnSecondsRef} />
              <span ref={turnMsRef} />
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 11, sm: 13 },
                opacity: 0.8,
                mt: 0.25,
              }}
            >
              <span ref={gameHoursRef} />
              <span className="time-colon">:</span>
              <span ref={gameMinutesRef} />
              <span className="time-colon">:</span>
              <span ref={gameSecondsRef} />
            </Typography>
          </Stack>

          <Stack
            sx={{
              textAlign: { xs: "right", sm: "center" },
              alignItems: { xs: "flex-end", sm: "center" },
              minWidth: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: 14, sm: 24 },
                fontWeight: { xs: 600, sm: "inherit" },
                lineHeight: { xs: 1.2, sm: "inherit" },
                whiteSpace: "nowrap",
              }}
            >
              Card {gameMetrics.numberOfCardsDrawn}/{gameMetrics.numberOfCards}
            </Typography>
            <Typography
              ref={avgCardTimeRef}
              sx={{
                fontSize: { xs: 11, sm: 13 },
                opacity: 0.8,
                mt: 0.25,
                whiteSpace: "nowrap",
              }}
            />
          </Stack>
        </Stack>

        <Box
          sx={{
            flex: 1,
            marginLeft: "auto",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1.5,

            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Tooltip
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            placement="bottom"
          >
            <IconButton
              sx={{
                color: "primary.contrastText",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                width: 38,
                height: 38,
                transition: "transform 0.15s ease, background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(1px) scale(0.96)",
                },
              }}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <AiOutlineFullscreenExit size={20} />
              ) : (
                <AiOutlineFullscreen size={20} />
              )}
            </IconButton>
          </Tooltip>

          {!isRemote && (
            <Tooltip
              title={gameMetrics.done ? "Exit game" : "Abandon game"}
              placement="bottom"
            >
              <IconButton
                sx={{
                  color: "primary.contrastText",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  width: 38,
                  height: 38,
                  transition:
                    "transform 0.15s ease, background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(1px) scale(0.96)",
                  },
                }}
                onClick={showExitGameDialog}
              >
                <IoExitOutline size={20} />
              </IconButton>
            </Tooltip>
          )}

          {!isRemote && (
            <ChatToggleButton
              sx={{
                color: "primary.contrastText",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                width: 38,
                height: 38,
                transition: "transform 0.15s ease, background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(1px) scale(0.96)",
                },
              }}
            />
          )}
        </Box>
      </Card>

      {!isRemote && (
        <>
          <SharedControlDialog
            open={sharedControlDialogOpen}
            onClose={() => setSharedControlDialogOpen(false)}
          />
          <ExitGameDialog
            open={exitGameDialogOpen}
            onClose={closeExitGameDialog}
          />
        </>
      )}
      <DNFDialog open={dnfDialogOpen} onClose={() => setDNFDialogOpen(false)} />
    </>
  );
};

export default Header;
