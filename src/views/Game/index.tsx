import { Box, Button, Card, CardContent, useTheme } from "@mui/material";
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useCardFlash } from "../../components/CardFlash";
import { GameChat } from "../../components/GameChat";
import MemeDialog from "../../components/MemeDialog";
import Terminal from "../../components/Terminal";
import { useTextFlash } from "../../components/TextFlash";
import { pickHypeMessage } from "../../components/TextFlash/messages";
import useIdleTimer from "../../hooks/idleTimer";
import { useSounds } from "../../hooks/sounds";
import useChat from "../../stores/chat";
import useGame from "../../stores/game";
import {
  MetricsStore,
  useGameMetrics,
  usePlayerMetrics,
} from "../../stores/metrics";
import useSettings from "../../stores/settings";
import { useSharedControl } from "../../stores/sharedControl";
import CardInventory from "./components/CardInventory";
import Chart from "./components/Chart";
import ChugDialog from "./components/ChugDialog";
import ChugsHistoryDialog from "./components/ChugsHistoryDialog";
import ChugsList from "./components/ChugsList";
import ExitGameDialog from "./components/ExitGameDialog";
import GameFinishedDialog from "./components/GameFinishedDialog";
import Header from "./components/Header";
import { MobileMoreMenu } from "./components/MobileMoreMenu";
import MobileNowDrawing from "./components/MobileNowDrawing";
import MobileStandings from "./components/MobileStandings";
import PlayerList from "./components/PlayerList";
import SharedControlDialog from "./components/SharedControlDialog";
import GameTable from "./components/Table";
import { useHostRemoteControl } from "./hooks/useHostRemoteControl";
import { useLeaderboardAnnouncer } from "./hooks/useLeaderboardAnnouncer";

const GameView: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isRemote, send: sendRemote } = useSharedControl();

  const [showTerminal, setShowTerminal] = useState(false);
  const [showSleepyMeme, setShowSleepyMeme] = useState(false);

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [mobileSharedControlDialogOpen, setMobileSharedControlDialogOpen] =
    useState(false);
  const [mobileExitDialogOpen, setMobileExitDialogOpen] = useState(false);
  const [mobileChugsDialogOpen, setMobileChugsDialogOpen] = useState(false);

  const cardFlasher = useCardFlash();
  const textFlasher = useTextFlash();

  const game = useGame(
    useShallow((state) => ({
      id: state.id,
      DrawCard: state.DrawCard,
      cards: state.draws,
      offline: state.offline,
      ExitGame: state.Exit,
      players: state.players,
    })),
  );

  // Connect to the website's live game chat whenever we have an online game.
  useEffect(() => {
    if (!game.offline && game.id) {
      useChat.getState().Connect(game.id);
    } else {
      useChat.getState().Disconnect();
    }

    return () => {
      useChat.getState().Disconnect();
    };
  }, [game.offline, game.id]);

  const settings = useSettings(
    useShallow((state) => ({
      themeMode: state.themeMode,
      setThemeMode: state.SetThemeMode,
    })),
  );

  const gameMetrics = useGameMetrics();
  const playerMetrics = usePlayerMetrics();
  const isGameDone = gameMetrics.done && !gameMetrics.chugging;
  const [finishedDialogOpen, setFinishedDialogOpen] = useState(true);

  useEffect(() => {
    if (!isGameDone) {
      setFinishedDialogOpen(true);
    }
  }, [isGameDone]);

  // King / Jester text flash announcer
  useLeaderboardAnnouncer({
    playerMetrics,
    cards: game.cards,
    players: game.players,
    currentRound: gameMetrics.currentRound,
    chugging: gameMetrics.chugging,
    textFlasher,
  });

  const sounds = useSounds();
  const spacePressedRef = useRef(false);

  const resetIdleTimer = useIdleTimer(
    () => {
      if (gameMetrics.chugging || gameMetrics.done) {
        return;
      }
      setShowSleepyMeme(true);
      sounds.play("tryk_paa_den_lange_tast");
    },
    1000 * 60 * 15 /* 15 minutes */,
  );

  const drawCard = useCallback(() => {
    setShowSleepyMeme(false);
    resetIdleTimer();

    // On a remote, proxy the draw through WebSocket
    if (isRemote) {
      sendRemote({ event: "DRAW_CARD" });
      return;
    }

    const [card, cardsLeft] = game.DrawCard();

    // If chug card, don't flash card, flash hype text
    if (card.value === 14) {
      cardFlasher.hide();
      textFlasher.flash(pickHypeMessage(), { variant: "hype" });
      return;
    }

    // If last card, don't flash it
    if (cardsLeft === 0) {
      cardFlasher.hide();
      return;
    }

    cardFlasher.flash(card);
  }, [isRemote, resetIdleTimer, sendRemote, game, cardFlasher, textFlasher]);

  // Sync host state with remote clients over WebSocket
  useHostRemoteControl({
    isRemote,
    drawCard,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (MetricsStore.getState().game.done) {
        return;
      }

      if (e.code === "Backquote") {
        setShowTerminal((prev) => !prev);
      }

      if (e.code === "Space") {
        e.preventDefault();

        if (spacePressedRef.current) {
          return;
        }

        spacePressedRef.current = true;

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
    },
    [drawCard],
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      spacePressedRef.current = false;
    }
  }, []);

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
  }, [handleKeyDown, handleKeyUp]);

  // Tracks card count to ensure drawn cards are flashed on remote clients
  const prevRemoteCardsCountRef = useRef(game.cards.length);

  useEffect(() => {
    if (!isRemote) {
      prevRemoteCardsCountRef.current = game.cards.length;
      return;
    }

    const cardsCount = game.cards.length;
    const cardWasDrawn = cardsCount > prevRemoteCardsCountRef.current;
    prevRemoteCardsCountRef.current = cardsCount;

    if (!cardWasDrawn) {
      return;
    }

    setShowSleepyMeme(false);
    resetIdleTimer();

    const latestCard = game.cards[game.cards.length - 1];
    if (!latestCard) {
      return;
    }

    // If chug card, don't flash card, flash hype text
    if (latestCard.value === 14) {
      cardFlasher.hide();
      textFlasher.flash(pickHypeMessage(), { variant: "hype" });
      return;
    }

    // If last card, don't flash it
    const totalCards =
      gameMetrics.numberOfCards > 0
        ? gameMetrics.numberOfCards
        : game.players.length * 13;
    const cardsLeft = totalCards - cardsCount;
    if (cardsLeft <= 0) {
      cardFlasher.hide();
      return;
    }

    cardFlasher.flash(latestCard);
  }, [
    isRemote,
    game.cards,
    game.players.length,
    gameMetrics.numberOfCards,
    cardFlasher,
    textFlasher,
    resetIdleTimer,
  ]);

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
          minHeight: "100vh",
          backgroundColor: "background.default",
          backgroundImage: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.22) 100%), radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
              : "linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.04) 100%), radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 24px 24px",
          backgroundRepeat: "no-repeat, repeat",
          backgroundAttachment: "fixed",
          overflow: "auto",
          padding: { xs: 1, sm: 1.5 },
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
              borderRadius: 2,
              borderColor: "divider",
              backgroundColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(36, 36, 36, 0.75)"
                  : "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(6px)",
              boxShadow: "none",
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
              resetIdleTimer();
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
            disabled={isGameDone}
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

          <MobileMoreMenu
            anchorEl={mobileMenuAnchor}
            onClose={() => setMobileMenuAnchor(null)}
            onOpenChugs={() => {
              setMobileMenuAnchor(null);
              setMobileChugsDialogOpen(true);
            }}
            onOpenSharedControl={() => {
              setMobileMenuAnchor(null);
              setMobileSharedControlDialogOpen(true);
            }}
            onOpenChat={() => {
              setMobileMenuAnchor(null);
              useChat.getState().Open();
            }}
            onExitGame={showMobileExitDialog}
            isRemote={isRemote}
            isGameDone={isGameDone}
            isOffline={game.offline}
            themeMode={settings.themeMode}
            onSetThemeMode={(mode) => settings.setThemeMode(mode)}
          />

          <SharedControlDialog
            open={mobileSharedControlDialogOpen}
            onClose={() => setMobileSharedControlDialogOpen(false)}
          />

          <ChugsHistoryDialog
            open={mobileChugsDialogOpen}
            onClose={() => setMobileChugsDialogOpen(false)}
          />

          <ExitGameDialog
            open={mobileExitDialogOpen}
            onClose={closeMobileExitDialog}
          />
        </Box>
      </Box>

      {/* Shared Dialogs */}
      <ChugDialog open={gameMetrics.chugging} />

      <GameFinishedDialog
        open={isGameDone && finishedDialogOpen && !isRemote}
        onClose={() => setFinishedDialogOpen(false)}
      />

      {!isRemote && <GameChat />}
    </>
  );
};

export default GameView;
