import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  darken,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useState } from "react";
import { ImCross } from "react-icons/im";
import * as AuthAPI from "../../../../api/endpoints/authentication";
import Conditional from "../../../../components/Conditional";
import { useSounds } from "../../../../hooks/sounds";
import { useNewGame } from "../contexts/newGame";

interface PlayerItemProps {
  index: number;
}

const PlayerItem: FunctionComponent<PlayerItemProps> = (props) => {
  const theme = useTheme();
  const { play } = useSounds();

  const newGame = useNewGame();
  const player = newGame.players[props.index];

  const [disabled, setDisabled] = useState(false);

  const isOffline = newGame.offline;

  const login = async () => {
    if (!player.username || !player.password) {
      return;
    }

    try {
      setDisabled(true);

      const resp = await AuthAPI.login(player.username, player.password || "");

      newGame.setPlayer(props.index, {
        ...player,
        token: resp.token,
        avatar: resp.image,
        ready: true,
      });
    } catch (e) {
      console.error(e);

      play("snack");
    } finally {
      setDisabled(false);
    }
  };

  const updateUsername = (username: string) => {
    newGame.setPlayer(props.index, {
      ...player,
      username,
      ready: isOffline && username !== "",
    });
  };

  const updatePassword = (password: string) => {
    newGame.setPlayer(props.index, {
      ...player,
      password,
    });
  };

  const remove = () => {
    play("click");

    newGame.setPlayer(props.index, {
      username: "",
      password: "",
      ready: false,
    });
  };

  return (
    <Box
      sx={{
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: theme.shape.borderRadius + "px",
      }}
    >
      <Box
        sx={{
          borderRadius: theme.shape.borderRadius + "px",
          overflow: "hidden",
        }}
      >
        <Stack direction="row">
          <TextField
            label={isOffline ? "display name" : "username"}
            fullWidth
            variant="filled"
            data-lpignore="true" // Disable LastPass
            InputProps={{
              disableUnderline: true,
            }}
            inputProps={{
              autoComplete: "new-password",
            }}
            sx={{
              "& .MuiFilledInput-root": {
                backgroundColor: "transparent",
                borderRadius: 0,
              },
              "& .MuiFilledInput-root.Mui-disabled": {
                backgroundColor: theme.palette.background.default,
              },
            }}
            value={player.username}
            onChange={(e) => updateUsername(e.target.value)}
            disabled={(player.ready && !isOffline) || disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isOffline) {
                login();
              }
            }}
          />

          {!isOffline && (
            <>
              <Divider orientation="vertical" flexItem />
              <TextField
                label="password"
                fullWidth
                variant="filled"
                type="password"
                InputProps={{
                  disableUnderline: true,
                }}
                inputProps={{
                  autoComplete: "new-password",
                }}
                sx={{
                  "& .MuiFilledInput-root": {
                    backgroundColor: "transparent",
                    borderRadius: 0,
                  },
                  "& .MuiFilledInput-root.Mui-disabled": {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
                value={player.password}
                onChange={(e) => updatePassword(e.target.value)}
                onBlur={login}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    login();
                  }
                }}
                disabled={player.ready || disabled}
              />
            </>
          )}

          {disabled ? (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                borderRadius: 0,
              }}
              src={player.avatar}
            >
              <CircularProgress color="inherit" size={24} />
            </Avatar>
          ) : (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                borderRadius: 0,
              }}
              src={player.avatar}
            />
          )}
        </Stack>
      </Box>

      <Conditional value={(player.ready && !isOffline) || disabled}>
        <IconButton
          onClick={remove}
          sx={{
            position: "absolute",
            right: -10,
            top: -10,
            backgroundColor: theme.palette.background.default,
            border: "1px solid",
            borderColor: "divider",

            "&:hover": {
              backgroundColor: darken(theme.palette.background.default, 0.1),
            },
          }}
        >
          <ImCross size={8} />
        </IconButton>
      </Conditional>
    </Box>
  );
};

export default PlayerItem;
