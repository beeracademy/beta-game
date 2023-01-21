import { FunctionComponent, useEffect, useState } from "react";
import { Box, Card, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import RemoteDialog from "./RemoteDialog";
import { IoLogoGameControllerB } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import ExitGameDialog from "./ExitGameDialog";
import { useNavigate } from "react-router-dom";
import useGame from "../../../stores/game";
import { secondsToHHMMSS } from "../../../utilities/time";
import useSettings from "../../../stores/settings";
import { MdWbSunny } from "react-icons/md";
import { BsMoonStarsFill } from "react-icons/bs";
import { useGameMetrics } from "../../../stores/metrics";
import DNFDialog from "./DNFDialog";

const Header: FunctionComponent = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const game = useGame((state) => ({
        gameStartTimestamp: state.gameStartTimestamp,
        turnStartTimestamp: state.turnStartTimestamp,
        numberOfRounds: state.numberOfRounds,
        ExitGame: state.Exit,
    }));

    const gameMetrics = useGameMetrics();

    const settings = useSettings((state) => ({
        themeMode: state.themeMode,
        SetThemeMode: state.SetThemeMode,
    }));

    const [remoteDialogOpen, setRemoteDialogOpen] = useState(false);
    const [exitGameDialogOpen, setExitGameDialogOpen] = useState(false);
    const [dnfDialogOpen, setDNFDialogOpen] = useState(false);

    const closeExitGameDialog = (e: { ok: boolean }) => {
        setExitGameDialogOpen(false);

        if (e.ok) {
            game.ExitGame();
            navigate("/login"); // Should be handled by protected route
        }
    };

    const [elapsedGameTime, setElapsedGameTime] = useState(0);
    const [elapsedTurnTime, setElapsedTurnTime] = useState(0);

    const updateTimes = () => {
        setElapsedGameTime(Date.now() - game.gameStartTimestamp);
        setElapsedTurnTime(Date.now() - game.turnStartTimestamp);
    };

    useEffect(() => {
        if (gameMetrics.done) {
            // TODO
        }

        updateTimes();

        const interval = setInterval(updateTimes, 1000);

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
                    <Tooltip title="Game remote settings" placement="right">
                        <IconButton
                            sx={{
                                color: "primary.contrastText",
                            }}
                            onClick={() => setRemoteDialogOpen(true)}
                        >
                            <IoLogoGameControllerB />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle between light and dark mode" placement="right">
                        <IconButton
                            sx={{
                                color: "primary.contrastText",
                            }}
                            onClick={() => {
                                settings.SetThemeMode(settings.themeMode === "light" ? "dark" : "light");
                            }}
                        >
                            {settings.themeMode === "dark" ? <BsMoonStarsFill size={20} /> : <MdWbSunny size={24} />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Stack direction="row" alignItems="center">
                    <Typography
                        variant="body1"
                        sx={{
                            [theme.breakpoints.down("sm")]: {
                                display: "none",
                            },
                        }}
                    >
                        Round {gameMetrics.currentRound} / {game.numberOfRounds}
                    </Typography>
                    <Stack
                        sx={{
                            textAlign: "center",
                            marginLeft: 8,
                            marginRight: 8,
                            width: 200,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 36,
                                fontWeight: 600,
                                lineHeight: 1,
                            }}
                        >
                            {secondsToHHMMSS(elapsedGameTime)}
                        </Typography>
                        <Typography>{secondsToHHMMSS(elapsedTurnTime)}</Typography>
                    </Stack>
                    <Typography
                        variant="body1"
                        sx={{
                            [theme.breakpoints.down("sm")]: {
                                display: "none",
                            },
                        }}
                    >
                        Card {gameMetrics.numberOfCardsDrawn} / {gameMetrics.numberOfCards}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        flex: 1,
                        marginLeft: "auto",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",

                        [theme.breakpoints.down("sm")]: {
                            display: "none",
                        },
                    }}
                >
                    <Tooltip title="Mark players as 'Did not finish'" placement="left">
                        <IconButton
                            sx={{
                                fontSize: 12,
                                width: 42,
                                height: 42,
                                marginRight: 2,
                                color: "primary.contrastText",
                            }}
                            onClick={() => setDNFDialogOpen(true)}
                        >
                            DNF
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Exit game" placement="left">
                        <IconButton
                            sx={{
                                color: "primary.contrastText",
                            }}
                            onClick={() => setExitGameDialogOpen(true)}
                        >
                            <IoExitOutline />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Card>

            <RemoteDialog open={remoteDialogOpen} onClose={() => setRemoteDialogOpen(false)} />
            <ExitGameDialog open={exitGameDialogOpen} onClose={closeExitGameDialog} />
            <DNFDialog open={dnfDialogOpen} onClose={() => setDNFDialogOpen(false)} />
        </>
    );
};

export default Header;
