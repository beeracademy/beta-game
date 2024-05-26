import {
  Box,
  Button,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FunctionComponent, createRef, useEffect } from "react";
import { IoInformationCircleOutline, IoPlay } from "react-icons/io5";
import { useSounds } from "../../../../hooks/sounds";
import useGame from "../../../../stores/game";
import { useNewGame } from "../contexts/newGame";
import GameModeSelector from "./GameModeSelector";
import NumberOfPlayersSelector from "./NumberOfPlayersSelector";
import PlayerList from "./PlayerList";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const SIP_IN_A_BEER = 14;
const NUMBER_OF_ROUNDS = 13;

interface NewGameFormProps {}

const NewGameForm: FunctionComponent<NewGameFormProps> = () => {
  const { play, stopAll } = useSounds();
  const StartGame = useGame((state) => state.Start);
  const newGame = useNewGame();

  const startButtonRef = createRef<HTMLButtonElement>();

  useEffect(() => {
    if (newGame.ready) {
      startButtonRef.current?.focus();
    }
  }, [newGame.ready]);

  const startGame = () => {
    StartGame(newGame.players, {
      offline: newGame.offline,
      numberOfRounds: NUMBER_OF_ROUNDS,
      sipsInABeer: SIP_IN_A_BEER,
    });

    stopAll();
    play("baladada");
  };

  const changeGameMode = (offline: boolean) => {
    play("click");

    newGame.setOffline(offline);
  };

  const changeNumberOfPlayers = (value: number) => {
    play("click");

    newGame.setNumberOfPlayers(value);
  };

  return (
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
        onClick={startGame}
        endIcon={<IoPlay size={24} />}
        disabled={!newGame.ready}
        ref={startButtonRef}
      >
        Start game
      </Button>

      {/* <Button
      component={NavLink}
      variant="outlined"
      size="large"
      to="/login/continue"
    >
      Continue a game
    </Button> */}
    </Stack>
  );
};

export default NewGameForm;
