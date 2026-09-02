import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { BsMoonStarsFill } from "react-icons/bs";
import { IoLogoGameControllerB } from "react-icons/io";
import { IoDesktopOutline, IoExitOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useFullscreen, useToggle } from "react-use";
import { useShallow } from "zustand/react/shallow";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import useSettings, {
  getNextThemeMode,
  type ThemeMode,
} from "../../../stores/settings";
import { secondsToHHMMSS, secondsToHHMMSSsss } from "../../../utilities/time";
import DNFDialog from "./DNFDialog";
import ExitGameDialog from "./ExitGameDialog";
import SharedControlDialog from "./SharedControlDialog";

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

  const [elapsedGameTime, setElapsedGameTime] = useState(0);
  const [elapsedTurnTime, setElapsedTurnTime] = useState(0);

  const updateTimes = () => {
    setElapsedGameTime(gameMetrics.GetElapsedGameTime());

    if (gameMetrics.done) {
      setElapsedTurnTime(0);
    } else {
      setElapsedTurnTime(gameMetrics.GetElapsedTurnTime());
    }
  };

  useEffect(() => {
    updateTimes();

    const interval = setInterval(updateTimes, 1);

    return () => clearInterval(interval);
  }, [gameMetrics.done, game.gameStartTimestamp, game.turnStartTimestamp]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          padding: 1,
          paddingLeft: 2,
          paddingRight: 2,
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
            gap: 2,

            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Tooltip title="Shared control settings" placement="bottom">
            <IconButton
              sx={{
                color: "primary.contrastText",
              }}
              onClick={() => {
                setSharedControlDialogOpen(true);
              }}
            >
              <IoLogoGameControllerB />
            </IconButton>
          </Tooltip>

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
                  }}
                  onClick={() => {
                    sound.play("click");
                    settings.SetThemeMode(nextThemeMode);
                  }}
                  aria-label={`Theme: ${themeTitle[settings.themeMode]}. Switch to ${themeTitle[nextThemeMode]} theme.`}
                >
                  {settings.themeMode === "system" ? (
                    <IoDesktopOutline size={20} />
                  ) : settings.themeMode === "dark" ? (
                    <BsMoonStarsFill size={20} />
                  ) : (
                    <MdWbSunny size={24} />
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
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              [theme.breakpoints.down("sm")]: {
                fontSize: 12,
              },
            }}
          >
            Round {gameMetrics.currentRound.toString().padStart(2, "0")}/
            {game.numberOfRounds}
          </Typography>

          <Stack
            sx={{
              textAlign: "center",
              marginLeft: 8,
              marginRight: 8,
            }}
          >
            <Typography
              sx={{
                fontSize: 36,
                fontWeight: 600,
                lineHeight: 1,

                [theme.breakpoints.down("sm")]: {
                  fontSize: 24,
                },
              }}
            >
              {secondsToHHMMSSsss(elapsedTurnTime)}
            </Typography>
            <Typography>{secondsToHHMMSS(elapsedGameTime)}</Typography>
          </Stack>

          <Typography
            variant="h5"
            sx={{
              [theme.breakpoints.down("sm")]: {
                fontSize: 12,
              },
            }}
          >
            Card {gameMetrics.numberOfCardsDrawn.toString().padStart(2, "0")}/
            {gameMetrics.numberOfCards}
          </Typography>
        </Stack>

        <Box
          sx={{
            flex: 1,
            marginLeft: "auto",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,

            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Tooltip title="Mark players as 'Did not finish'" placement="bottom">
            <IconButton
              sx={{
                fontSize: 12,
                width: 42,
                height: 42,
                color: "primary.contrastText",
              }}
              onClick={() => setDNFDialogOpen(true)}
            >
              DNF
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            placement="bottom"
          >
            <IconButton
              sx={{
                color: "primary.contrastText",
              }}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <AiOutlineFullscreenExit />
              ) : (
                <AiOutlineFullscreen />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip
            title={gameMetrics.done ? "Exit game" : "Abandon game"}
            placement="bottom"
          >
            <IconButton
              sx={{
                color: "primary.contrastText",
              }}
              onClick={showExitGameDialog}
            >
              <IoExitOutline />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      <SharedControlDialog
        open={sharedControlDialogOpen}
        onClose={() => setSharedControlDialogOpen(false)}
      />
      <ExitGameDialog open={exitGameDialogOpen} onClose={closeExitGameDialog} />
      <DNFDialog open={dnfDialogOpen} onClose={() => setDNFDialogOpen(false)} />
    </>
  );
};

export default Header;
