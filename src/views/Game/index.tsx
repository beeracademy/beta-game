import { Box, Card, CardContent } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import useWebSocket from "../../api/websocket";
import { useCardFlash } from "../../components/CardFlash";
import Terminal from "../../components/Terminal";
import useGame from "../../stores/game";
import { MetricsStore, useGameMetrics } from "../../stores/metrics";
import useSettings from "../../stores/settings";
import CardInventory from "./components/CardInventory";
import Chart from "./components/Chart";
import ChugDialog from "./components/ChugDialog";
import ChugsList from "./components/ChugsList";
import GameFinishedDialog from "./components/GamFinishedDialog";
import Header from "./components/Header";
import PlayerList from "./components/PlayerList";
import GameTable from "./components/Table";

const GameView: FunctionComponent = () => {
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const flashCard = useCardFlash();

  const game = useGame((state) => ({
    DrawCard: state.DrawCard,
    cards: state.draws,
  }));

  const settings = useSettings((state) => ({
    remoteControl: state.remoteControl,
    remoteToken: state.remoteToken,
  }));

  const gameMetrics = useGameMetrics();

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
    const card = game.DrawCard();

    flashCard(card);
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
          padding: 1,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 2,
          }}
        >
          <Header />

          <CardInventory />

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
        </Box>
      </Box>

      <ChugDialog open={gameMetrics.chugging} />

      <GameFinishedDialog open={gameMetrics.done} />

      <Terminal
        open={showTerminal}
        onClose={() => {
          setShowTerminal(false);
        }}
      />

      {/* <MemeDialog open={true} tag="bowling meme"/> */}
    </>
  );
};

export default GameView;
