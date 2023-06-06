import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";

interface GameOverDialogProps extends DialogProps {}

const GameOverDialog: FunctionComponent<GameOverDialogProps> = (props) => {
  const game = useGame((state) => ({
    Exit: state.Exit,
  }));

  return (
    <Dialog {...props}>
      <DialogTitle textAlign="center">
        <Typography variant="h4">Game Over</Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          minWidth: 500,
        }}
      >
        {/* Row of players in their rank order */}

        <Stack
          direction="row"
          spacing={2}
          sx={{
            marginTop: 2,
            marginBottom: 2,
          }}
          justifyContent="space-around"
        ></Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
        }}
      >
        <Stack flex="1" spacing={1}>
          <Button variant="contained" color="primary" fullWidth size="large">
            Play Again
          </Button>
          <Button variant="outlined" fullWidth size="large" onClick={game.Exit}>
            Exit
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog;
