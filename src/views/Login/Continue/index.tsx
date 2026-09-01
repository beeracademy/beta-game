import {
  Box,
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
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import * as GameAPI from "../../../api/endpoints/game";
import { Game } from "../../../api/models/game";
import Conditional from "../../../components/Conditional";
import { Player } from "../../../models/player";
import useGame from "../../../stores/game";
import { mapToLocal } from "../../../stores/game.mapper";
import { datetimeToddmmHHMMSS } from "../../../utilities/time";
import LoginHeaderActions from "../components/LoginHeaderActions";
import BottomGamesCount from "../components/BottomGamesCount";
import ContinueGameDialog from "./components/ContinueGameDialog";

const ContinueGameView: FunctionComponent = () => {
  const Resume = useGame((state) => state.Resume);

  const [player, setPlayer] = useState<Player | null>(null);
  const [resumableGames, setResumableGames] = useState<GameAPI.ResumableGame[]>(
    [],
  );
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const fetchResumableGames = async () => {
    if (!player || !player.token) {
      return;
    }

    const response = await GameAPI.getResumableGames(player.token);
    setResumableGames(response);
  };

  const resumeGame = async (gameId: number) => {
    if (!player || !player.token) {
      return;
    }

    const response = await GameAPI.postResumeGame(player.token, gameId);

    if (response) {
      setSelectedGame(response);
    }
  };

  const confirmResume = () => {
    if (!selectedGame) {
      return;
    }

    Resume(mapToLocal(selectedGame));
  };

  useEffect(() => {
    fetchResumableGames();
  }, [player]);

  return (
    <>
      <Helmet>
        <title>Academy - Continue a game</title>
      </Helmet>

      <Fade in={true}>
        <Card
          sx={{
            width: { xs: "100%", sm: 580, md: 600 },
            maxWidth: "100%",
            height: { xs: "100%", md: "auto" },
            maxHeight: { xs: "100%", md: "calc(100vh - 48px)" },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 0, sm: 2 },
            overflow: "hidden",
            zIndex: 10,
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                : "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          <CardHeader
            title="Continue a game"
            action={<LoginHeaderActions />}
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              backgroundColor: "background.paper",
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              "& .MuiCardHeader-action": {
                m: 0,
                alignSelf: "center",
              },
            }}
          />

          <Divider />

          <Box
            sx={{
              overflowY: "auto",
              overflowX: "hidden",
              flex: 1,
              p: { xs: 1, sm: 2 },
            }}
          >
            <CardContent>
              You can continue a game started from another device by signing in
              with one of the players participating here and selecting the game
              you want to continue.
            </CardContent>

            <Conditional value={player !== null}>
              <Divider />
            </Conditional>

            <Conditional value={player !== null && resumableGames.length === 0}>
              <CardContent
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  textAlign: "center",
                }}
              >
                <Typography>
                  There are no resumable games for this player
                </Typography>
              </CardContent>
            </Conditional>

            <Conditional value={player !== null && resumableGames.length > 0}>
              <CardContent
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {/* List of games with their name, users and creation date */}
                <List dense disablePadding>
                  {resumableGames.map((game) => {
                    return (
                      <ListItemButton
                        onClick={() => resumeGame(game.id)}
                        key={game.id}
                      >
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
            </Conditional>

            <Divider sx={{ my: 1 }} />

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

              <BottomGamesCount />
            </CardContent>
          </Box>
        </Card>
      </Fade>

      {selectedGame && (
        <ContinueGameDialog
          open={!!selectedGame}
          game={selectedGame}
          onClose={(e: { ok: boolean }) => {
            if (e.ok) {
              confirmResume();
            } else {
              setSelectedGame(null);
            }
          }}
        />
      )}
    </>
  );
};

export default ContinueGameView;
