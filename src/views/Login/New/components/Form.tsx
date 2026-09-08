import {
  Alert,
  alpha,
  Box,
  Button,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { type FunctionComponent, useState } from "react";
import { IoInformationCircleOutline, IoPlay } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import { useSounds } from "../../../../hooks/sounds";
import type { Player } from "../../../../models/player";
import useGame from "../../../../stores/game";
import BottomGamesCount from "../../components/BottomGamesCount";
import { useNewGame } from "../contexts/newGame";
import GameModeSelector from "./GameModeSelector";
import NumberOfPlayersSelector from "./NumberOfPlayersSelector";
import PlayerList from "./PlayerList";
import PreGameScreen from "./PreGameScreen";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const SIP_IN_A_BEER = 14;
const NUMBER_OF_ROUNDS = 13;

type NewGameFormProps = {};

const NewGameForm: FunctionComponent<NewGameFormProps> = () => {
  const { play, stopAll } = useSounds();
  const StartGame = useGame((state) => state.Start);
  const newGame = useNewGame();

  const [preGameOpen, setPreGameOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const openPreGame = () => {
    if (!newGame.ready) {
      return;
    }

    play("click");
    setStartError(null);
    newGame.setTitle("Shuffle player order?");
    newGame.setWide(newGame.players.length > 5);
    setPreGameOpen(true);
  };

  const startGame = async (players: Player[]) => {
    setPreGameOpen(false);

    stopAll();
    play("baladada");

    try {
      await StartGame(players, {
        offline: newGame.offline,
        numberOfRounds: NUMBER_OF_ROUNDS,
        sipsInABeer: SIP_IN_A_BEER,
      });
    } catch (error) {
      console.error("[NewGameForm] Failed to start game:", error);

      stopAll();
      play("wilhelm_scream");
      setStartError(
        "Could not start the game. Check your internet connection and try again.",
      );
    }
  };

  const changeGameMode = (offline: boolean) => {
    play("click");

    newGame.setOffline(offline);
  };

  const changeNumberOfPlayers = (value: number) => {
    play("click");

    newGame.setNumberOfPlayers(value);
  };

  if (preGameOpen) {
    return <PreGameScreen players={newGame.players} onStart={startGame} />;
  }

  return (
    <Stack spacing={2}>
      {startError && (
        <Alert severity="error" variant="outlined">
          {startError}
        </Alert>
      )}

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

        <GameModeSelector value={newGame.offline} onChange={changeGameMode} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="body1">Number of players</Typography>

        <NumberOfPlayersSelector
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          value={newGame.numberOfPlayers}
          onChange={changeNumberOfPlayers}
        />
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="body1" sx={{}}>
          {newGame.offline ? "Player names" : "Player login"}
        </Typography>

        <PlayerList />
      </Stack>
      <Divider />

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={openPreGame}
        endIcon={<IoPlay size={24} />}
        sx={{
          ...(!newGame.ready && {
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? "grey.300"
                : alpha(t.palette.grey[100], 0.15),
            color: "grey.500",

            "&:hover": {
              backgroundColor: (t) =>
                t.palette.mode === "light"
                  ? "grey.300"
                  : alpha(t.palette.grey[100], 0.15),
            },
          }),
        }}
      >
        Continue
      </Button>

      <Button
        component={NavLink}
        variant="outlined"
        color="inherit"
        size="large"
        to="/login/continue"
      >
        Resume a game
      </Button>

      <BottomGamesCount />
    </Stack>
  );
};

export default NewGameForm;
