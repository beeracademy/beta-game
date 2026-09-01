import {
  Box,
  Button,
  Card,
  CardContent,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BsMoonStarsFill, BsThreeDotsVertical } from "react-icons/bs";
import { IoLogoGameControllerB } from "react-icons/io";
import { IoDesktopOutline, IoExitOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../api/websocket";
import { useCardFlash } from "../../components/CardFlash";
import MemeDialog from "../../components/MemeDialog";
import Terminal from "../../components/Terminal";
import useIdleTimer from "../../hooks/idleTimer";
import { useSounds } from "../../hooks/sounds";
import useGame from "../../stores/game";
import { MetricsStore, useGameMetrics } from "../../stores/metrics";
import useSettings, { getNextThemeMode } from "../../stores/settings";
import CardInventory from "./components/CardInventory";
import Chart from "./components/Chart";
import ChugDialog from "./components/ChugDialog";
import ChugsList from "./components/ChugsList";
import ExitGameDialog from "./components/ExitGameDialog";
import GameFinishedDialog from "./components/GameFinishedDialog";
import Header from "./components/Header";
import MobileNowDrawing from "./components/MobileNowDrawing";
import MobileStandings from "./components/MobileStandings";
import PlayerList from "./components/PlayerList";
import RemoteDialog from "./components/RemoteDialog";
import GameTable from "./components/Table";

import { useShallow } from "zustand/react/shallow";

const GameView: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [showTerminal, setShowTerminal] = useState(false);
  const [showSleepyMeme, setShowSleepyMeme] = useState(false);

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [mobileRemoteDialogOpen, setMobileRemoteDialogOpen] = useState(false);
  const [mobileExitDialogOpen, setMobileExitDialogOpen] = useState(false);

  const cardFlasher = useCardFlash();

  const game = useGame(
    useShallow((state) => ({
      DrawCard: state.DrawCard,
      cards: state.draws,
      offline: state.offline,
      ExitGame: state.Exit,
    })),
  );

  const settings = useSettings(
    useShallow((state) => ({
      themeMode: state.themeMode,
      setThemeMode: state.SetThemeMode,
      remoteControl: state.remoteControl,
      remoteToken: state.remoteToken,
    })),
  );

  const gameMetrics = useGameMetrics();
  const isGameDone = gameMetrics.done && !gameMetrics.chugging;
  const [finishedDialogOpen, setFinishedDialogOpen] = useState(true);

  useEffect(() => {
    if (!isGameDone) {
      setFinishedDialogOpen(true);
    }
  }, [isGameDone]);

  const sounds = useSounds();

  let spacePressed = false;

  const ws = useWebSocket();

  useEffect(() => {
    console.log(
      "To open the game terminal, press the ` key. (top left of keyboard, no not escape... the one below escape)",
    );

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!settings.remoteControl) {
      return;
    }

    ws.connect(`wss://academy.beer/ws/remote/${settings.remoteToken}/`);

    return () => {
      ws.close();
    };
  }, [settings.remoteControl, settings.remoteToken]);

  useEffect(() => {
    if (!ws.ready) {
      return;
    }

    ws.receive((data) => {
      if (data.event === "GET_GAME_STATE") {
        ws.send({
          event: "GAME_STATE",
          payload: useGame.getState(),
        });
      }

      if (data.event === "DRAW_CARD") {
        drawCard();
      }
    });

    const unsubscribe = useGame.subscribe((state) => {
      ws.send({
        event: "GAME_STATE",
        payload: state,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [ws.ready]);

  useEffect(() => {
    if (!ws.ready) {
      return;
    }

    if (settings.remoteControl) {
      return;
    }
    ws.send({
      event: "REMOTES_DISCONNECT",
    });

    ws.close();
  }, [settings.remoteControl]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (MetricsStore.getState().game.done) {
      return;
    }

    if (e.code === "Backquote") {
      setShowTerminal((prev) => !prev);
    }

    if (e.code === "Space") {
      e.preventDefault();

      if (spacePressed) {
        return;
      }

      spacePressed = true;

      // When chugging is in progress, Space is reserved for ChugDialog start/stop
      if (MetricsStore.getState().game.chugging) {
        return;
      }

      try {
        drawCard();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    spacePressed = false;
  };

  const drawCard = () => {
    setShowSleepyMeme(false);
    resetIdleTimer();

    const [card, cardsLeft] = game.DrawCard();

    // If chug card, don't flash it
    if (card.value === 14) {
      cardFlasher.hide();
      return;
    }

    // If last card, don't flash it
    if (cardsLeft === 0) {
      cardFlasher.hide();
      return;
    }

    cardFlasher.flash(card);
  };

  const resetIdleTimer = useIdleTimer(
    () => {
      if (gameMetrics.chugging) {
        return;
      }
      setShowSleepyMeme(true);
      sounds.play("tryk_paa_den_lange_tast");
    },
    1000 * 60 * 15 /* 15 minutes */,
  );

  const showMobileExitDialog = () => {
    setMobileMenuAnchor(null);

    if (gameMetrics.done) {
      game.ExitGame({ dnf: false });
      return;
    }

    setMobileExitDialogOpen(true);
  };

  const closeMobileExitDialog = (e: { ok: boolean }) => {
    setMobileExitDialogOpen(false);

    if (e.ok) {
      game.ExitGame({ dnf: true });
      navigate("/login");
    }
  };

  return (
    <>
      <Helmet>
        <title>Academy</title>
      </Helmet>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          backgroundColor: "background.default",
          overflow: "auto",
          padding: 1,
          gap: 2,
        }}
      >
        {/* Desktop */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 2,

            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Header />

          <CardInventory onCardClick={drawCard} />

          <ChugsList />

          <Card
            variant="outlined"
            sx={{
              margin: "auto 0",
              height: "100%",
              maxHeight: "600px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                boxSizing: "border-box",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                height: "100%",
                flex: 1,
                gap: 2,
                p: 2,
                "&:last-child": {
                  pb: 2,
                },
              }}
            >
              <GameTable />
              <Chart />
            </CardContent>
          </Card>

          <PlayerList />

          <Terminal
            open={showTerminal}
            onClose={() => {
              setShowTerminal(false);
            }}
          />

          <MemeDialog
            open={showSleepyMeme}
            onClose={() => {
              setShowSleepyMeme(false);
            }}
            tag="sleepy boring snoring"
          />
        </Box>

        {/* Mobile */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            gap: 1,

            [theme.breakpoints.up("sm")]: {
              display: "none",
            },
          }}
        >
          <Header />

          <MobileNowDrawing />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              gap: 1.5,
              overflowY: "auto",
              paddingTop: 1,
              paddingBottom: 1,
            }}
          >
            <MobileStandings />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: 60, fontSize: 20 }}
            onClick={drawCard}
          >
            Draw card
          </Button>

          <Button
            variant="text"
            color="inherit"
            fullWidth
            sx={{ height: 40, color: "text.secondary" }}
            onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
          >
            <BsThreeDotsVertical size={18} style={{ marginRight: 8 }} />
            More options
          </Button>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={!!mobileMenuAnchor}
            onClose={() => setMobileMenuAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <MenuItem
              onClick={() => {
                setMobileMenuAnchor(null);
                setMobileRemoteDialogOpen(true);
              }}
            >
              <IoLogoGameControllerB size={20} style={{ marginRight: 12 }} />
              Game remote
            </MenuItem>

            <MenuItem
              onClick={() => {
                sounds.play("click");
                settings.setThemeMode(getNextThemeMode(settings.themeMode));
              }}
            >
              {settings.themeMode === "system" ? (
                <IoDesktopOutline size={20} style={{ marginRight: 12 }} />
              ) : settings.themeMode === "dark" ? (
                <BsMoonStarsFill size={18} style={{ marginRight: 12 }} />
              ) : (
                <MdWbSunny size={20} style={{ marginRight: 12 }} />
              )}
              Theme:{" "}
              {settings.themeMode === "system"
                ? "System"
                : settings.themeMode === "dark"
                  ? "Dark"
                  : "Light"}
            </MenuItem>

            <MenuItem onClick={showMobileExitDialog}>
              <IoExitOutline size={20} style={{ marginRight: 12 }} />
              Exit game
            </MenuItem>
          </Menu>

          <RemoteDialog
            open={mobileRemoteDialogOpen}
            onClose={() => setMobileRemoteDialogOpen(false)}
          />

          <ExitGameDialog
            open={mobileExitDialogOpen}
            onClose={closeMobileExitDialog}
          />
        </Box>
      </Box>

      {/* Shared */}

      <ChugDialog open={gameMetrics.chugging} />

      <GameFinishedDialog
        open={isGameDone && finishedDialogOpen}
        onClose={() => setFinishedDialogOpen(false)}
      />
    </>
  );
};

export default GameView;
