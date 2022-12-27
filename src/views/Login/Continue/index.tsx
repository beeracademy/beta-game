import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Fade,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";
import { Helmet } from "react-helmet";
import { NavLink } from "react-router-dom";
import PlayerList from "../components/PlayerList";

const ContinueGameView: FunctionComponent = () => {
    const theme = useTheme();

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
                        <PlayerList numberOfPlayers={1} />
                    </CardContent>

                    <Divider />

                    <CardContent>
                        {/* List of games with their name, users and creation date */}
                        <List dense disablePadding>
                            <ListItemButton onClick={() => {}}>
                                <ListItemText primary="Game 1" secondary="Created 2021-09-01 12:00:00" />
                                <ListItemText
                                    sx={{
                                        textAlign: "right",
                                    }}
                                >
                                    player1, player2, player3, player4
                                </ListItemText>
                            </ListItemButton>

                            <ListItemButton onClick={() => {}}>
                                <ListItemText primary="Game 1" secondary="Created 2021-09-01 12:00:00" />
                                <ListItemText
                                    sx={{
                                        textAlign: "right",
                                    }}
                                >
                                    player1, player2, player3, player4
                                </ListItemText>
                            </ListItemButton>

                            <ListItemButton onClick={() => {}}>
                                <ListItemText primary="Game 1" secondary="Created 2021-09-01 12:00:00" />
                                <ListItemText
                                    sx={{
                                        textAlign: "right",
                                    }}
                                >
                                    player1, player2, player3, player4
                                </ListItemText>
                            </ListItemButton>
                        </List>
                    </CardContent>

                    <Divider />

                    <CardContent>
                        <Button variant="contained" color="primary" fullWidth component={NavLink} to="/login">
                            Back to new game
                        </Button>
                    </CardContent>
                </Card>
            </Fade>
        </>
    );
};

export default ContinueGameView;
