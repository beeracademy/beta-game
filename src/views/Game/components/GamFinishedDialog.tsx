import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Fab,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import { FunctionComponent, memo, useEffect, useRef, useState } from "react";
import { BsCamera } from "react-icons/bs";
import { PiCameraRotate } from "react-icons/pi";
import { useVideoDevices } from "../../../hooks/camera";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";

interface GameFinishedDialogProps extends DialogProps {}

const GameFinishedDialog: FunctionComponent<GameFinishedDialogProps> = (
  props,
) => {
  const ref = useRef<FireworksHandlers>(null);

  const theme = useTheme();
  const sounds = useSounds();

  const [description, setMessage] = useState("");

  const game = useGame((state) => ({
    Exit: state.Exit,
  }));

  useEffect(() => {
    if (props.open) {
      sounds.play("cheering");
    }
  }, [props.open]);

  const saveAndExit = () => {
    game.Exit({
      dnf: false,
      description,
    });
  };

  return (
    <>
      {props.open && (
        <Fireworks
          ref={ref}
          options={{
            acceleration: 1,
            autoresize: true,
            intensity: 20,
            lineWidth: {
              explosion: {
                min: 1,
                max: 8,
              },
              trace: {
                min: 0.1,
                max: 5,
              },
            },
            rocketsPoint: {
              min: 0,
              max: 100,
            },
            sound: {
              enabled: true,
              files: ["sounds/firework.mp3"],
            },
          }}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "fixed",
          }}
        />
      )}

      <Dialog
        {...props}
        PaperProps={{
          sx: {
            minWidth: 500,
          },
        }}
      >
        <DialogTitle textAlign="center" variant="h4">
          Game finished
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 0,
          }}
        >
          {/* TODO: implement */}
          {/* <Camera /> */}

          <Stack
            sx={{
              padding: 2,
              paddingBottom: 0,
              paddingTop: 0,
            }}
          >
            <textarea
              style={{
                height: 150,
                resize: "none",
                border: "none",
                outline: "none",
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius + "px",
                borderColor: theme.palette.divider,
                borderStyle: "solid",
                borderWidth: "1px",
                marginTop: theme.spacing(2),
                padding: theme.spacing(1),
                fontSize: theme.typography.body1.fontSize,
              }}
              placeholder="Write a description"
              maxLength={1000}
              value={description}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 2,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={saveAndExit}
          >
            Save and exit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Camera: FunctionComponent = memo(() => {
  const { devices: cameraDevices, error: cameraError } = useVideoDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null,
  );

  const hasNoDevices = cameraDevices && cameraDevices.length === 0;
  const hasMultipleDevices = cameraDevices && cameraDevices.length > 1;

  useEffect(() => {
    if (cameraDevices) {
      setSelectedDevice(cameraDevices[0]);
    }
  }, [cameraDevices]);

  const takePicture = async () => {
    if (!selectedDevice) {
      return;
    }

    const video = document.querySelector("video") as HTMLVideoElement;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
    });
  };

  const changeCamera = () => {
    if (!cameraDevices) {
      return;
    }

    const currentIndex = cameraDevices.findIndex(
      (d) => d.deviceId === selectedDevice?.deviceId,
    );

    const nextIndex = (currentIndex + 1) % cameraDevices.length;

    setSelectedDevice(cameraDevices[nextIndex]);
  };

  return (
    <Stack spacing={1} alignItems={"center"}>
      <Box
        sx={{
          height: "400px",
          width: "500px",
          maxWidth: "500px",
          overflow: "hidden",
        }}
      >
        <video
          id="video"
          autoPlay
          playsInline
          style={{
            width: "calc(100% + 2px)",
            height: "100%",
            marginRight: "-1px",
            marginLeft: "-1px",
          }}
          ref={(video) => {
            if (video && selectedDevice) {
              navigator.mediaDevices
                .getUserMedia({
                  video: {
                    deviceId: selectedDevice.deviceId,
                  },
                })
                .then((stream) => {
                  video.srcObject = stream;
                });
            }
          }}
        />
      </Box>

      <Stack
        spacing={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box sx={{ width: "30%", textAlign: "left" }} />

        <Box sx={{ width: "40%" }}>
          <Fab
            onClick={takePicture}
            size="large"
            color="primary"
            disabled={!selectedDevice}
          >
            <BsCamera size={32} />
          </Fab>
        </Box>

        <Box sx={{ width: "30%" }}>
          <IconButton
            onClick={changeCamera}
            sx={{
              display: hasNoDevices || !hasMultipleDevices ? "none" : undefined,
            }}
          >
            <PiCameraRotate size={32} />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
});

export default GameFinishedDialog;
