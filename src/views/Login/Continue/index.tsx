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
import Conditional from "../../../components/Conditional";
import useGame from "../../../stores/game";
import { mapToLocal } from "../../../stores/game.mapper";
import { stopAll } from "../../../hooks/sounds";
import ContinueGameDialog from "../components/ContinueGameDialog";

const ContinueGameView: FunctionComponent = () => {
  const theme = useTheme();

  const { Resume } = useGame((state) => ({
    Resume: state.Resume,
  }));

  const [player, setPlayer] = useState<Player | null>(null);
  const [resumableGames, setResumableGames] = useState<
    GameAPI.IResumableGame[]
  >([]);
  const [selectedGame, setSelectedGame] = useState<GameAPI.IGameState | null>(
    null
  );

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

    stopAll();
    Resume(mapToLocal(selectedGame));
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
            You can continue a game started from another device by signing in
            with one of the players participating here and selecting the game
            you want to continue.
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
