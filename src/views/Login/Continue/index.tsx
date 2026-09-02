import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Fade,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useNavigate } from "react-router-dom";
import * as AuthAPI from "../../../api/endpoints/authentication";
import * as GameAPI from "../../../api/endpoints/game";
import type { Game } from "../../../api/models/game";
import Conditional from "../../../components/Conditional";
import { useSounds } from "../../../hooks/sounds";
import type { Player } from "../../../models/player";
import useGame from "../../../stores/game";
import { mapToLocal } from "../../../stores/game.mapper";
import { datetimeToddmmHHMMSS } from "../../../utilities/time";
import BottomGamesCount from "../components/BottomGamesCount";
import LoginHeaderActions from "../components/LoginHeaderActions";
import ContinueGameDialog from "./components/ContinueGameDialog";

const ContinueGameView: FunctionComponent = () => {
  const navigate = useNavigate();
  const { play } = useSounds();
  const Resume = useGame((state) => state.Resume);

  const [player, setPlayer] = useState<Player | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [resumableGames, setResumableGames] = useState<GameAPI.ResumableGame[]>(
    [],
  );
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [fetchGamesError, setFetchGamesError] = useState<string | null>(null);
  const [isResumingGameId, setIsResumingGameId] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const resp = await AuthAPI.login(username.trim(), password);
      play("click");
      setPlayer({
        id: resp.id,
        username: username.trim(),
        token: resp.token,
        image: resp.image,
      });
      setPassword("");
    } catch (err: any) {
      console.error("[Continue] Login failed:", err);
      play("snack");
      const message =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        "Unable to log in with provided credentials.";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    play("click");
    setPlayer(null);
    setResumableGames([]);
    setFetchGamesError(null);
  };

  const fetchResumableGames = useCallback(async () => {
    if (!player || !player.token) {
      return;
    }

    setIsLoadingGames(true);
    setFetchGamesError(null);

    try {
      const response = await GameAPI.getResumableGames(player.token);
      setResumableGames(response);
    } catch (err: any) {
      console.error("[Continue] Failed to fetch resumable games:", err);
      const message =
        err?.response?.data?.detail || "Failed to load resumable games.";
      setFetchGamesError(message);
    } finally {
      setIsLoadingGames(false);
    }
  }, [player]);

  const resumeGame = async (gameId: number) => {
    if (!player || !player.token) {
      return;
    }

    play("click");
    setIsResumingGameId(gameId);
    setFetchGamesError(null);

    try {
      const response = await GameAPI.postResumeGame(player.token, gameId);
      if (response) {
        setSelectedGame(response);
      }
    } catch (err: any) {
      console.error("[Continue] Failed to load game for resume:", err);
      play("snack");
      const message =
        err?.response?.data?.detail || "Failed to load game state to resume.";
      setFetchGamesError(message);
    } finally {
      setIsResumingGameId(null);
    }
  };

  const confirmResume = () => {
    if (!selectedGame) {
      return;
    }

    play("click");
    Resume(mapToLocal(selectedGame));
    navigate("/");
  };

  useEffect(() => {
    fetchResumableGames();
  }, [fetchResumableGames]);

  return (
    <>
      <Helmet>
        <title>Academy - Resume a game</title>
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
            title="Resume a game"
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
              <Typography variant="body2" color="text.secondary">
                You can resume a game started from another device by signing in
                with one of the players participating and selecting the game you
                want to resume.
              </Typography>
            </CardContent>

            {player === null ? (
              <CardContent sx={{ pt: 0 }}>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: (t) => `${t.shape.borderRadius}px`,
                        overflow: "hidden",
                      }}
                    >
                      <Stack direction="row">
                        <TextField
                          label="username"
                          fullWidth
                          variant="filled"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            if (loginError) setLoginError(null);
                          }}
                          disabled={isLoggingIn}
                          autoFocus
                          slotProps={{
                            input: { disableUnderline: true },
                            htmlInput: { autoComplete: "username" },
                          }}
                          sx={{
                            "& .MuiFilledInput-root": {
                              backgroundColor: "transparent",
                              borderRadius: 0,
                            },
                            "& .MuiFilledInput-root.Mui-disabled": {
                              backgroundColor: "background.default",
                            },
                          }}
                        />
                        <Divider orientation="vertical" flexItem />
                        <TextField
                          label="password"
                          fullWidth
                          variant="filled"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (loginError) setLoginError(null);
                          }}
                          disabled={isLoggingIn}
                          slotProps={{
                            input: { disableUnderline: true },
                            htmlInput: { autoComplete: "current-password" },
                          }}
                          sx={{
                            "& .MuiFilledInput-root": {
                              backgroundColor: "transparent",
                              borderRadius: 0,
                            },
                            "& .MuiFilledInput-root.Mui-disabled": {
                              backgroundColor: "background.default",
                            },
                          }}
                        />
                      </Stack>
                    </Box>

                    {loginError && <Alert severity="error">{loginError}</Alert>}

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      disabled={isLoggingIn || !username.trim() || !password}
                    >
                      {isLoggingIn ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Sign in to see games"
                      )}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            ) : (
              <CardContent sx={{ pt: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: (t) => `${t.shape.borderRadius}px`,
                    backgroundColor: (t) =>
                      t.palette.mode === "dark"
                        ? alpha(t.palette.background.paper, 0.6)
                        : alpha(t.palette.grey[100], 0.8),
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <Avatar src={player.image} alt={player.username}>
                      {player.username?.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Signed in as
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {player.username}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={handleSignOut}
                  >
                    Change player
                  </Button>
                </Box>
              </CardContent>
            )}

            <Conditional value={player !== null}>
              <Divider sx={{ my: 1 }} />
            </Conditional>

            {player !== null && (
              <>
                {isLoadingGames && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 4,
                    }}
                  >
                    <CircularProgress size={36} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Loading ongoing games...
                    </Typography>
                  </Box>
                )}

                {fetchGamesError && (
                  <CardContent sx={{ pt: 0 }}>
                    <Alert
                      severity="error"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={fetchResumableGames}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {fetchGamesError}
                    </Alert>
                  </CardContent>
                )}

                {!isLoadingGames &&
                  !fetchGamesError &&
                  resumableGames.length === 0 && (
                    <CardContent
                      sx={{
                        my: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        There are no resumable games for this player
                      </Typography>
                    </CardContent>
                  )}

                {!isLoadingGames &&
                  !fetchGamesError &&
                  resumableGames.length > 0 && (
                    <CardContent
                      sx={{
                        maxHeight: 400,
                        overflowY: "auto",
                        overflowX: "hidden",
                        p: 1,
                      }}
                    >
                      <List dense disablePadding>
                        {resumableGames.map((game) => (
                          <ListItemButton
                            onClick={() => resumeGame(game.id)}
                            key={game.id}
                            disabled={isResumingGameId !== null}
                            sx={{
                              py: 1.5,
                              px: 2,
                              borderRadius: (t) => `${t.shape.borderRadius}px`,
                              mb: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": {
                                backgroundColor: (t) =>
                                  alpha(t.palette.primary.main, 0.08),
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Game #{game.id}
                                </Typography>
                              }
                              secondary={datetimeToddmmHHMMSS(
                                game.start_datetime,
                              )}
                            />
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center" }}
                            >
                              <ListItemText
                                sx={{ textAlign: "right" }}
                                secondary={game.players
                                  .map((p) => p.username)
                                  .join(", ")}
                              />
                              {isResumingGameId === game.id && (
                                <CircularProgress size={20} />
                              )}
                            </Stack>
                          </ListItemButton>
                        ))}
                      </List>
                    </CardContent>
                  )}
              </>
            )}

            <Divider sx={{ my: 1 }} />

            <CardContent>
              <Button
                variant="outlined"
                color="inherit"
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
          onConfirm={confirmResume}
          onCancel={() => setSelectedGame(null)}
        />
      )}
    </>
  );
};

export default ContinueGameView;
