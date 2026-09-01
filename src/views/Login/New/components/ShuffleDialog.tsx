import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
} from "@mui/material";
import { FunctionComponent } from "react";

interface ShuffleDialogProps extends DialogProps {}

const ShuffleDialog: FunctionComponent<ShuffleDialogProps> = (props) => {
  return (
    <Dialog {...props} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontSize: 24 }}>
        Shuffle player order before starting?
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} direction="row" sx={{ justifyContent: "center" }}>
          {new Array(6).fill(0).map((_, i) => (
            <Avatar
              src={
                Math.random() > 0.5
                  ? "https://thiscatdoesnotexist.com/"
                  : "https://thispersondoesnotexist.com/image"
              }
              key={i}
              sx={{
                width: 100,
                height: 100,
              }}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary" size="large" fullWidth>
          Shuffle em!
        </Button>
        <Button variant="outlined" color="inherit" size="large" fullWidth>
          Keep order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShuffleDialog;
