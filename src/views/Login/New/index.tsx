import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useState } from "react";
import { NavLink } from "react-router-dom";
import PlayerList from "../components/PlayerList";
import { IoInformationCircleOutline, IoPlay } from "react-icons/io5";
import GameModeSelector, { GameMode } from "../components/GameModeSelector";
import NumberOfPlayersSelector from "../components/NumberOfPlayersSelector";
import { useSounds } from "../../../hooks/sounds";
import { Helmet } from "react-helmet";
import useGame from "../../../stores/game";
import ShuffleDialog from "./components/ShuffleDialog";
import { Player } from "../../../models/player";
import Conditional from "../../../components/Conditional";
import TimeAttackSettings from "../components/TimeAttackSettings";
import useNewGameForm from "./stores/new";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

const NewGameView: FunctionComponent = () => {
  const theme = useTheme();
  const { play, stopAll } = useSounds();

  const StartGame = useGame((state) => state.Start);

  const form = useNewGameForm();

  const startGame = () => {
    StartGame(form.players, {
      offline: form.gameMode === "offline",
      numberOfRounds: 13,
      sipsInABeer: 14,
    });

    stopAll();
    play("baladada");
  };

  const changeGameMode = (mode: GameMode) => {
    form.SetGameMode(mode);
    play("click");
  };

  const changeNumberOfPlayers = (value: number) => {
    form.SetNumberOfPlayers(value);
    play("click");
  };

  return (
    <>
      <Helmet>
        <title>Academy - New Game</title>
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
          <CardHeader title="New Game" />

          <Divider
            sx={{
              marginLeft: 2,
              marginRight: 2,
            }}
          />

          <CardContent>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Tooltip
                  title="Offline games will not be visible on the website and stats will not be collected."
                  placement="right"
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1,
                      width: "fit-content",
                    }}
                  >
                    <Typography variant="body1">Game mode</Typography>
                    <IoInformationCircleOutline />
                  </Box>
                </Tooltip>

                <GameModeSelector
                  value={form.gameMode}
                  onChange={changeGameMode}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body1">Number of players</Typography>

                <NumberOfPlayersSelector
                  min={MIN_PLAYERS}
                  max={MAX_PLAYERS}
                  value={form.numberOfPlayers}
                  onChange={changeNumberOfPlayers}
                />
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="body1" sx={{}}>
                  {form.gameMode === "offline" ? "Players" : "Player login"}
                </Typography>

                <PlayerList
                  numberOfPlayers={form.numberOfPlayers}
                  usernameOnly={form.gameMode === "offline"}
                />
              </Stack>
              <Divider />

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={startGame}
                endIcon={<IoPlay size={24} />}
                disabled={!form.ready}
              >
                Start game
              </Button>

              <Button
                component={NavLink}
                variant="outlined"
                size="large"
                to="/login/continue"
              >
                Continue a game
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>

      <ShuffleDialog open={false} />
    </>
  );
};

export default NewGameView;
