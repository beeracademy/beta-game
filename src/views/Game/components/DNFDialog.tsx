import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";
import { useSounds } from "../../../hooks/sounds";
interface DNFDialogProps extends DialogProps {}

const DNFDialog: FunctionComponent<DNFDialogProps> = (props) => {
  const players = useGame((state) => state.players);
  const sound = useSounds();

  const toggle = (index: number) => {
    sound.play("moops");
  };

  return (
    <Dialog {...props}>
      <DialogTitle textAlign="center">
        <Typography variant="h4">Did not finish?</Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          minWidth: 500,
        }}
      >
        <DialogContentText>
          Mark players who did not finish the game.
        </DialogContentText>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{
            marginTop: 4,
          }}
        >
          {players.map((player, index) => {
            return (
              <Box
                key={player.id}
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
                    width: 64,
                    height: 64,
                  }}
                />

                <Typography
                  key={player.id}
                  variant="caption"
                  sx={{
                    maxWidth: 64,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {player.username}
                </Typography>

                <Box sx={{
                  background: `url(/cross.svg)`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center", 
                  opacity: 0.75,     
                  position: "absolute",
                  top: -8,
                  width: 90,
                  height: 90,                              
                }} />
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
        }}
      >
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

export default DNFDialog;
