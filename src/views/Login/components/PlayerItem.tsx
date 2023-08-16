import {
  Avatar,
  Box,
  Divider,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import * as AuthAPI from "../../../api/endpoints/authentication";
import { useSounds } from "../../../hooks/sounds";
import { Player } from "../../../models/player";

interface PlayerItemProps {
  hidePassword?: boolean;
  onReady?: (player: Player) => void;
  onRemove?: () => void;
}

const PlayerItem: FunctionComponent<PlayerItemProps> = (props) => {
  const theme = useTheme();
  const { play } = useSounds();

  const [image, setImage] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);

  const [username, setUsername] = useState("player1"); // TODO: remove
  const [password, setPassword] = useState("test");

  useEffect(() => {
    if (props.hidePassword && username.length > 0) {
      setReady(true);
      props.onReady?.({
        username: username,
      });
    }
  }, [username, password, props.hidePassword]);

  const login = async () => {
    try {
      setLocked(true);

      const resp = await AuthAPI.login(username, password);
      setImage(resp.image);
      setReady(true);

      props.onReady?.({
        username: username,
        id: resp.id,
        token: resp.token,
        image: resp.image,
      });
    } catch (e) {
      console.error(e);

      play("snack");
      setPassword("");
      setLocked(false);
    }
  };

  const remove = () => {
    setUsername("");
    setPassword("");
    setImage(null);
    setLocked(false);
    setReady(false);

    props.onRemove?.();
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Stack direction="row">
        <TextField
          label="username"
          fullWidth
          variant="filled"
          autoComplete="off"
          InputProps={{
            disableUnderline: true,
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={locked}
          onKeyDown={(e) => {
            if (e.key === "Enter" && props.hidePassword) {
              login();
            }
          }}
        />

        {!props.hidePassword && (
          <>
            <Divider orientation="vertical" flexItem />
            <TextField
              label="password"
              fullWidth
              autoComplete="off"
              variant="filled"
              type="password"
              InputProps={{
                disableUnderline: true,
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={login}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
              disabled={locked}
            />
          </>
        )}

        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 0,
            backgroundColor: "#bdbdbd",
            position: "relative",
            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              borderRadius: 0,
            }}
            src={image || ""}
          />

          {locked && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: 0,
                transition: (t) =>
                  t.transitions.create("opacity", {
                    duration: t.transitions.duration.shortest,
                  }),
                "&:hover": {
                  opacity: 1,
                  background: "rgba(0, 0, 0, 0.5)",
                  cursor: "pointer",
                },
              }}
              onClick={remove}
            >
              <ImCross size={24} color={theme.palette.primary.main} />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default PlayerItem;
