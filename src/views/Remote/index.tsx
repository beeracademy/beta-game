import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { IoLogoGameControllerB } from "react-icons/io";
import { IoGameController } from "react-icons/io5";
import { useSearchParam } from "react-use";
import useWebSocket from "../../api/websocket";
import useGame from "../../stores/game";
import GameTable from "../Game/components/Table";
import LastCardDrawn from "./components/LastCardDrawn";

interface RemoteViewProps {}

const RemoteView: FunctionComponent<RemoteViewProps> = () => {
  const [connecting, setConnecting] = useState<boolean>(true);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const theme = useTheme();

  const token = useSearchParam("token");
  const game = useGame();

  const ws = useWebSocket();

  useEffect(() => {
    if (!token) {
      return;
    }

    setConnecting(true);

    ws.connect(`wss://academy.beer/ws/remote/${token}/`);

    return () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    if (!ws.ready) {
      return;
    }

    ws.receive((data) => {
      if (data.event === "GAME_STATE") {
        setConnecting(false);
        setLoading(false);

        useGame.setState(data.payload);
      }

      if (data.event === "REMOTES_DISCONNECT") {
        setDisconnected(true);
      }
    });

    ws.send({
      event: "GET_GAME_STATE",
    });
  }, [ws.ready]);

  return (
    <Container
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        padding: 2,

        [theme.breakpoints.up("md")]: {
          borderRadius: (t) => `${t.shape.borderRadius}px`,
          width: 500,
          height: 800,
          margin: "auto",
        },
      }}
    >
      {!connecting && !disconnected && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              flex: 1,
              gap: 4,
            }}
          >
            <Typography variant="h4">Latest Card Drawn</Typography>

            <LastCardDrawn />
          </Box>
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              height: 64,
              fontSize: 24,
            }}
            onClick={() => {
              if (!ws.ready) {
                return;
              }

              setLoading(true);

              ws.send({
                event: "DRAW_CARD",
              });
            }}
          >
            {loading && <CircularProgress size={24} color="inherit" />}
            {!loading && "Draw Card"}
          </Button>
        </>
      )}

      {connecting && !disconnected && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            flex: 1,
            gap: 4,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            connecting to game
          </Typography>
        </Box>
      )}

      {disconnected && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            flex: 1,
            gap: 4,
          }}
        >
          <IoLogoGameControllerB size={74} color={theme.palette.primary.main} />
          <Typography variant="body1" color="text.secondary">
            Game Remote Unavailable
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default RemoteView;
