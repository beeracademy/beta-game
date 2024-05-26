import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";
import { BsCamera } from "react-icons/bs";
import { HiOutlinePlusSm } from "react-icons/hi";
import useGame from "../../../stores/game";

interface GameFinishedDialogProps extends DialogProps {}

const GameFinishedDialog: FunctionComponent<GameFinishedDialogProps> = (
  props,
) => {
  const game = useGame((state) => ({
    Exit: state.Exit,
  }));

  const theme = useTheme();

  return (
    <Dialog {...props}>
      <DialogTitle textAlign="center" variant="h4">
        Game finished!
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          minWidth: 500,
          height: "fit-content",
        }}
      >
        {/* Row of players in their rank order */}

        <ButtonBase
          sx={{
            borderRadius: (t) => t.shape.borderRadius + "px",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Box
            sx={{
              height: 350,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: (t) => t.palette.grey[200],
              // backgroundImage:
              //   "url(https://source.unsplash.com/random/800x600)",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <BsCamera size={64} />
              <HiOutlinePlusSm
                size={32}
                style={{
                  position: "absolute",
                  right: -20,
                  top: -5,
                }}
              />
            </Box>
          </Box>
        </ButtonBase>

        <Divider
          sx={{
            marginTop: 2,
            marginBottom: 2,
          }}
        />

        <textarea
          style={{
            width: "100%",
            height: 50,
            resize: "none",
            border: "none",
            outline: "none",
            color: theme.palette.text.primary,
            backgroundColor: "transparent",
          }}
          placeholder="Write a description"
          maxLength={1000}
        />
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
        }}
      >
        <Stack flex="1" spacing={1}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => game.Exit()}
          >
            Submit
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default GameFinishedDialog;
