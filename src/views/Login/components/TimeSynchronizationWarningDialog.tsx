import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { TbClockX } from "react-icons/tb";
import { isLocalTimeSynchronized } from "../../../utilities/time";

interface TimeSynchronizationWarningDialogProps {}

const TimeSynchronizationWarningDialog: FunctionComponent<
  TimeSynchronizationWarningDialogProps
> = () => {
  const theme = useTheme();

  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeDifference, setTimeDifference] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [isSynchronized, difference] = await isLocalTimeSynchronized();

      setTimeDifference(difference);
      setShowTimeWarning(!isSynchronized);
    })();
  }, []);

  return (
    <Dialog
      open={showTimeWarning}
      PaperProps={{
        sx: {
          maxWidth: "400px",
        },
      }}
    >
      <DialogContent>
        <Stack alignItems="center" textAlign="center" spacing={2}>
          <TbClockX size={96} color={theme.palette.error.dark} />

          <p>
            Your local system time is not synchronized with the server time.
          </p>

          <p>
            Your are {timeDifference && timeDifference > 0 ? "ahead" : "behind"}{" "}
            by {timeDifference} ms.
          </p>

          <p>
            Please make sure your system time is synchronized to avoid any
            problems.
          </p>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={() => setShowTimeWarning(false)}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeSynchronizationWarningDialog;
