import { Box, Card, CardContent } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useCardFlash } from "../../components/CardFlash";
import Terminal from "../../components/Terminal";
import useGame from "../../stores/game";
import { MetricsStore, useGameMetrics } from "../../stores/metrics";
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
        cards: state.cards,
    }));

    const gameMetrics = useGameMetrics();

    let spacePressed = false;

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
            const card = game.DrawCard();

            if (card.value == 14) {
                setShowChugDialog(true);
                return;
            }

            flashCard(card);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        spacePressed = false;
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
        </>
    );
};

export default GameView;
