import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { GoDeviceDesktop, GoDeviceMobile } from "react-icons/go";
import { IoCheckmark, IoClose } from "react-icons/io5";
import QRCode from "react-qr-code";
import { useShallow } from "zustand/react/shallow";
import useGame from "../../../stores/game";
import useSettings from "../../../stores/settings";

interface SharedControlDialogProps extends DialogProps {}

const SharedControlDialog: FunctionComponent<SharedControlDialogProps> = (
  props,
) => {
  const theme = useTheme();

  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      offline: state.offline,
    })),
  );

  const settings = useSettings(
    useShallow((state) => ({
      remoteControl: state.remoteControl,
      remoteToken: state.remoteToken,
      SetRemoteControl: state.SetRemoteControl,
    })),
  );

  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!settings.remoteControl) {
      return;
    }
    setUrl(`${window.location.origin}/remote?token=${settings.remoteToken}`);
  }, [settings.remoteControl, settings.remoteToken]);

  const handleToggle = () => {
    if (game.offline) {
      return;
    }
    setUrl("");
    setCopied(false);
    settings.SetRemoteControl(!settings.remoteControl);
  };

  return (
    <Dialog {...props} maxWidth="xs" fullWidth>
      <IconButton
        aria-label="Close"
        onClick={(e) => props.onClose?.(e, "backdropClick")}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <IoClose size={20} />
      </IconButton>

      <DialogTitle>Shared Control</DialogTitle>

      {game.offline && (
        <DialogContent sx={{ textAlign: "center" }}>
          <Box sx={{ py: 3, opacity: 0.6 }}>
            <GoDeviceMobile size={64} />
            <GoDeviceDesktop size={64} />
          </Box>
          <Typography color="text.secondary">
            Shared control is not available for offline games.
          </Typography>
        </DialogContent>
      )}

      {!game.offline && !settings.remoteControl && (
        <DialogContent sx={{ textAlign: "center" }}>
          <Box sx={{ py: 3, opacity: 0.6 }}>
            <GoDeviceMobile size={64} />
            <GoDeviceDesktop size={64} />
          </Box>
          <Typography color="text.secondary">
            Shared control lets other devices see and control the game — draw
            cards, see metrics, and more.
          </Typography>
        </DialogContent>
      )}

      {!game.offline && settings.remoteControl && (
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: url ? 1 : 0,
              transition: theme.transitions.create("opacity"),
            }}
          >
            <QRCode value={url} size={200} />
          </Box>
          <Typography color="text.secondary">
            Scan this QR code with your phone to connect or share the link
          </Typography>
        </DialogContent>
      )}

      <DialogActions>
        {/* Copy / Share — only shown when shared control is active */}
        {!game.offline && settings.remoteControl && !navigator.share && (
          <Button
            fullWidth
            variant="contained"
            color={copied ? "success" : "primary"}
            size="large"
            endIcon={copied ? <IoCheckmark size={20} /> : undefined}
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
              copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
            }}
            sx={{ transition: "background-color 0.2s ease" }}
          >
            {copied ? "Copied!" : "Copy link"}
          </Button>
        )}

        {!game.offline && settings.remoteControl && navigator.share && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              navigator.share({
                title: "Academy — Shared Control",
                text: game.players.map((p) => p.username).join(", "),
                url,
              });
            }}
          >
            Share link
          </Button>
        )}

        {/* Toggle button — primary when off, secondary when on */}
        {!game.offline && (
          <Button
            fullWidth
            variant={settings.remoteControl ? "outlined" : "contained"}
            color={settings.remoteControl ? "inherit" : "primary"}
            size="large"
            onClick={handleToggle}
          >
            {settings.remoteControl
              ? "Disable shared control"
              : "Enable shared control"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SharedControlDialog;
