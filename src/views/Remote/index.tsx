import { Box, Button, Container, Typography } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { useSearchParam } from "react-use";
import useWebSocket from "../../api/websocket";
import useGame from "../../stores/game";
import GameTable from "../Game/components/Table";
import LastCardDrawn from "./components/LastCardDrawn";

interface RemoteViewProps {}

const RemoteView: FunctionComponent<RemoteViewProps> = () => {
    const token = useSearchParam("token");
    const game = useGame();

    const ws = useWebSocket();

    useEffect(() => {
        if (!token) {
            return;
        }

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
                useGame.setState(data.payload);
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
            }}
        >
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
                sx={{
                    height: 64,
                    fontSize: 24,
                }}
                onClick={() => {
                    if (!ws.ready) {
                        return;
                    }

                    ws.send({
                        event: "DRAW_CARD",
                    });
                }}
            >
                Draw Card
            </Button>
        </Container>
    );
};

export default RemoteView;
