import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { MdCloudUpload, MdFileDownload } from "react-icons/md";
import useGame from "../../../stores/game";

// How often the upload is retried automatically, matching the old game
const RETRY_INTERVAL_MS = 5000;

interface RetryUploadDialogProps extends Omit<DialogProps, "onClose"> {
  description?: string;
  onUploaded: () => void;
  onDismiss: () => void;
}

const RetryUploadDialog: FunctionComponent<RetryUploadDialogProps> = ({
  description,
  onUploaded,
  onDismiss,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async () => {
    if (useGame.getState().submitted) {
      onUploaded();
      return;
    }

    setIsRetrying(true);
    try {
      await useGame.getState().Submit({ description });
      onUploaded();
    } catch (error) {
      console.debug("[RetryUploadDialog] Upload retry failed", error);
    } finally {
      setIsRetrying(false);
    }
  }, [description, onUploaded]);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    const interval = setInterval(retry, RETRY_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [props.open, retry]);

  const handleDownload = () => {
    const game = useGame.getState().ExportGameData({ description });

    const dataUrl = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(game),
    )}`;

    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataUrl);
    anchor.setAttribute("download", `game_${game.id ?? "offline"}.json`);
    // Required for Firefox
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <Dialog
      {...props}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            maxWidth: { xs: "100%", sm: 520 },
          },
        },
      }}
    >
      <DialogContent sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 1 }}>
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            Failed to upload game
          </Typography>

          <Typography variant="body2" color="text.secondary">
            The game could not be sent to the website. We keep retrying
            automatically, but you can also download a copy of the game and give
            it to an admin, who can upload it to the website later.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", py: 1 }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {isRetrying ? "Uploading..." : "Retrying..."}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 4 },
          pb: 3,
          pt: 1,
        }}
      >
        <Stack spacing={1.5} sx={{ width: "100%" }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={isRetrying}
            startIcon={<MdCloudUpload size={22} />}
            onClick={retry}
          >
            Retry upload now
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<MdFileDownload size={22} />}
            onClick={handleDownload}
          >
            Download game file
          </Button>

          <Button fullWidth color="inherit" size="large" onClick={onDismiss}>
            Dismiss
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default RetryUploadDialog;
