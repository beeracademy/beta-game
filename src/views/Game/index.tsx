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
import GameOverDialog from "./components/GameOverDialog";
import Header from "./components/Header";
import PlayerList from "./components/PlayerList";
import GameTable from "./components/Table";

const GameView: FunctionComponent = () => {
    const [showTerminal, setShowTerminal] = useState<boolean>(false);
    const [showChugDialog, setShowChugDialog] = useState<boolean>(false);

    const flashCard = useCardFlash();

    const game = useGame((state) => ({
        DrawCard: state.Draw,
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
            "To open the game terminal, press the ` key. (top left of keyboard, no not escape... the one below escape)"
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
                const card = drawCard();
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

            drawCard();
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        spacePressed = false;
    };

    const drawCard = () => {
        const card = game.DrawCard();

        if (card.value == 14) {
            setShowChugDialog(true);
            return;
        }

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
                    flexDirection: "column",
                    width: "100vw",
                    backgroundColor: "background.default",
                    padding: 1,
                    gap: 2,
                }}
            >
                <Header />

                <CardInventory />

                <Card
                    variant="outlined"
                    sx={{
                        marginBottom: "auto",
                    }}
                >
                    <CardContent
                        sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            gap: 2,
                            height: "450px",
                        }}
                    >
                        <GameTable />
                        <Chart />
                    </CardContent>
                </Card>

                <PlayerList />
            </Box>

            <GameOverDialog open={gameMetrics.done} />

            <ChugDialog
                open={showChugDialog}
                onClose={() => {
                    setShowChugDialog(false);
                }}
            />

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
