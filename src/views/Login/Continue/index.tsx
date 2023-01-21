import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Fade,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { NavLink } from "react-router-dom";
import PlayerItem from "../components/PlayerItem";
import * as GameAPI from "../../../api/endpoints/game";
import { Player } from "../../../models/player";
import { datetimeToddmmHHMMSS } from "../../../utilities/time";

const ContinueGameView: FunctionComponent = () => {
    const theme = useTheme();

    const [player, setPlayer] = useState<Player | null>(null);
    const [resumableGames, setResumableGames] = useState<GameAPI.IResumableGame[]>([]);

    const fetchResumableGames = async () => {
        if (player === null) {
            return;
        }

        const response = await GameAPI.getResumableGames(player.token);
        setResumableGames(response);
    };

    useEffect(() => {
        fetchResumableGames();
    }, [player]);

    return (
        <>
            <Helmet>
                <title>Academy - Continue Game</title>
            </Helmet>

            <Fade in={true}>
                <Card
                    sx={{
                        padding: 1,
                        width: 600,
                        zIndex: 10,

                        [theme.breakpoints.down("md")]: {
                            height: "100vh",
                            width: "100vw",
                            padding: 0,
                            borderRadius: 0,
                            overflowY: "auto",
                        },
                    }}
                >
                    <CardHeader title="Continue game" />

                    <Divider
                        sx={{
                            marginLeft: 2,
                            marginRight: 2,
                        }}
                    />

                    <CardContent>
                        You can continue a game started from another device by signing in with one of the players
                        participating here and selecting the game you want to continue.
                    </CardContent>

                    <CardContent>
                        <PlayerItem
                            onLogin={async (p) => {
                                setPlayer(p);
                            }}
                            onRemove={() => {
                                setPlayer(null);
                                setResumableGames([]);
                            }}
                        />
                    </CardContent>

                    {player && <Divider />}

                    {
                        // If there are no resumable games, show a message
                        player && resumableGames.length === 0 && (
                            <CardContent
                                sx={{
                                    marginTop: 2,
                                    marginBottom: 2,
                                    textAlign: "center",
                                }}
                            >
                                <Typography>There are no resumable games for this player</Typography>
                            </CardContent>
                        )
                    }

                    {resumableGames.length > 0 && (
                        <CardContent>
                            {/* List of games with their name, users and creation date */}
                            <List dense disablePadding>
                                {resumableGames.map((game) => {
                                    return (
                                        <ListItemButton onClick={() => {}} key={game.id}>
                                            <ListItemText
                                                primary={`Game #${game.id}`}
                                                secondary={datetimeToddmmHHMMSS(game.start_datetime)}
                                            />
                                            <ListItemText
                                                sx={{
                                                    textAlign: "right",
                                                }}
                                            >
                                                {game.players.map((p) => p.username).join(", ")}
                                            </ListItemText>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </CardContent>
                    )}

                    <Divider />

                    <CardContent>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            component={NavLink}
                            to="/login"
                            size="large"
                        >
                            Back to new game
                        </Button>
                    </CardContent>
                </Card>
            </Fade>
        </>
    );
};

export default ContinueGameView;
