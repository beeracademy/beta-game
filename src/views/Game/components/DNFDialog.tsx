import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { type FunctionComponent, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
import { useSharedControl } from "../../../stores/sharedControl";
import PlayerCross from "./PlayerCross";

interface DNFDialogProps extends DialogProps {}

const DNFDialog: FunctionComponent<DNFDialogProps> = (props) => {
  const { players, dnf_player_indexes, SetPlayerDNF } = useGame(
    useShallow((state) => ({
      players: state.players,
      dnf_player_indexes: state.dnf_player_indexes,
      SetPlayerDNF: state.SetPlayerDNF,
    })),
  );

  const { isRemote, send: sendRemote } = useSharedControl();
  const sound = useSounds();

  useEffect(() => {
    if (props.open && isRemote) {
      sendRemote({ event: "GET_DNF_STATE" });
    }
  }, [props.open, isRemote, sendRemote]);

  const toggle = (index: number) => {
    const isDNF = !dnf_player_indexes.includes(index);

    if (isDNF) {
      sound.play("wilhelm_scream");
    }

    if (isRemote) {
      sendRemote({
        event: "SET_PLAYER_DNF",
        payload: {
          playerIndex: index,
          playerId: players[index]?.id,
          dnf: isDNF,
        },
      });
      return;
    }

    SetPlayerDNF(index, isDNF);
  };

  return (
    <Dialog
      {...props}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: "fit-content",
            minWidth: { xs: "calc(100vw - 32px)", sm: 400 },
            maxWidth: "calc(100vw - 48px)",
          },
        },
      }}
    >
      <DialogTitle>Did not finish?</DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          overflowX: "hidden",
        }}
      >
        <DialogContentText>
          Mark players who did not finish the game.
        </DialogContentText>

        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          {players.map((player, index) => {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 1,
                  borderRadius: (t) => `${t.shape.borderRadius}px`,
                }}
                component={ButtonBase}
                onClick={() => toggle(index)}
              >
                <Avatar
                  src={player.image}
                  sx={{
                    width: 94,
                    height: 94,
                  }}
                />

                <Typography
                  key={player.id}
                  variant="caption"
                  sx={{
                    maxWidth: 94,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {player.username}
                </Typography>

                {dnf_player_indexes.includes(index || 0) && <PlayerCross />}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => props.onClose?.({}, "escapeKeyDown")}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { PlayerCross };
export default DNFDialog;
