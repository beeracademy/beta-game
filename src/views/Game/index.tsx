import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BsMoonStarsFill } from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa6";
import { IoDesktopOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import useWebSocket from "../../api/websocket";
import { useCardFlash } from "../../components/CardFlash";
import MemeDialog from "../../components/MemeDialog";
import Terminal from "../../components/Terminal";
import { useSounds } from "../../hooks/sounds";
import useGame from "../../stores/game";
import { MetricsStore, useGameMetrics } from "../../stores/metrics";
import useSettings, { getNextThemeMode } from "../../stores/settings";
import CardInventory from "./components/CardInventory";
import Chart from "./components/Chart";
import ChugDialog from "./components/ChugDialog";
import ChugsList from "./components/ChugsList";
import GameFinishedDialog from "./components/GameFinishedDialog";
import Header from "./components/Header";
import PlayerList from "./components/PlayerList";
import GameTable from "./components/Table";

import { useShallow } from "zustand/react/shallow";

const GameView: FunctionComponent = () => {
  const theme = useTheme();

  const [showTerminal, setShowTerminal] = useState(false);
  const [showSleepyMeme, setShowSleepyMeme] = useState(false);

  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const cardFlasher = useCardFlash();

  const game = useGame(
    useShallow((state) => ({
      DrawCard: state.DrawCard,
      cards: state.draws,
      offline: state.offline,
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

  const sounds = useSounds();

  let spacePressed = false;

  const ws = useWebSocket();

  useEffect(() => {
    console.log(
      "To open the game terminal, press the ` key. (top left of keyboard, no not escape... the one below escape)",
    );

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    scheduleReminderSound();

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

    scheduleReminderSound();
  };

  let reminderTimerRef: number;
  const reminderIntervalMs = 1000 * 60 * 15; // 15 minutes

  const scheduleReminderSound = () => {
    clearTimeout(reminderTimerRef);

    reminderTimerRef = setTimeout(() => {
      setShowSleepyMeme(true);
      sounds.play("tryk_paa_den_lange_tast");
      scheduleReminderSound();
    }, reminderIntervalMs);
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
              minHeight: "350px",
            }}
          >
            <CardContent
              sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                height: "100%",
                gap: 2,
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
            gap: 1,

            [theme.breakpoints.up("sm")]: {
              display: "none",
            },
          }}
        >
          <Header />

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
            }}
          ></Box>

          <Stack spacing={1}>
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
              color="primary"
              fullWidth
              onClick={() => setShowMobileDrawer(true)}
            >
              <FaChevronUp />
            </Button>

            <SwipeableDrawer
              anchor="bottom"
              open={showMobileDrawer}
              onOpen={() => setShowMobileDrawer(true)}
              onClose={() => setShowMobileDrawer(false)}
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <List>
                <ListItemButton onClick={drawCard}>
                  <ListItemText primary="Draw card" />
                </ListItemButton>

                {/* toggle item for theme mode */}
                <ListItemButton
                  onClick={() => {
                    sounds.play("click");
                    settings.setThemeMode(
                      getNextThemeMode(settings.themeMode),
                    );
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {settings.themeMode === "system" ? (
                      <IoDesktopOutline size={20} />
                    ) : settings.themeMode === "dark" ? (
                      <BsMoonStarsFill size={18} />
                    ) : (
                      <MdWbSunny size={20} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Theme"
                    secondary={
                      settings.themeMode === "system"
                        ? "System"
                        : settings.themeMode === "dark"
                          ? "Dark"
                          : "Light"
                    }
                  />
                </ListItemButton>
              </List>
            </SwipeableDrawer>
          </Stack>
        </Box>
      </Box>

      {/* Shared */}

      <ChugDialog open={gameMetrics.chugging} />

      <GameFinishedDialog
        open={gameMetrics.done && !gameMetrics.chugging}
      />
    </>
  );
};

export default GameView;
