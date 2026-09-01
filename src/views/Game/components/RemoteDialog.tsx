import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { GoDeviceDesktop, GoDeviceMobile } from "react-icons/go";
import { IoCheckmark, IoClose } from "react-icons/io5";
import QRCode from "react-qr-code";
import useGame from "../../../stores/game";
import useSettings from "../../../stores/settings";
import { useShallow } from "zustand/react/shallow";

interface RemoteDialogProps extends DialogProps {}

const RemoteDialog: FunctionComponent<RemoteDialogProps> = (props) => {
  const theme = useTheme();

  const players = useGame((state) => state.players);

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

      <DialogTitle>Game Remote</DialogTitle>

      {!settings.remoteControl && (
        <DialogContent sx={{ textAlign: "center" }}>
          <Box sx={{ py: 3, opacity: 0.6 }}>
            <GoDeviceMobile size={64} />
            <GoDeviceDesktop size={64} />
          </Box>
          <Typography color="text.secondary">
            Game remote lets you control the game from your phone — draw cards,
            see metrics, and more.
          </Typography>
        </DialogContent>
      )}

      {settings.remoteControl && (
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
        {/* Copy / Share — only shown when remote is active */}
        {settings.remoteControl && !navigator.share && (
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

        {settings.remoteControl && navigator.share && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              navigator.share({
                title: "Academy Game Remote",
                text: players.map((p) => p.username).join(", "),
                url,
              });
            }}
          >
            Share link
          </Button>
        )}

        {/* Toggle button — primary when off, secondary when on */}
        <Button
          fullWidth
          variant={settings.remoteControl ? "outlined" : "contained"}
          color={settings.remoteControl ? "inherit" : "primary"}
          size="large"
          onClick={handleToggle}
        >
          {settings.remoteControl ? "Disable remote" : "Enable remote"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoteDialog;
