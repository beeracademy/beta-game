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

interface DNFDialogProps extends DialogProps {}

const DNFDialog: FunctionComponent<DNFDialogProps> = (props) => {
  const players = useGame((state) => state.players);

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
          {players.map((player) => {
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
