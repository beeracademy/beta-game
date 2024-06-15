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
import { FunctionComponent, useEffect, useState } from "react";
import { BsCamera } from "react-icons/bs";
import { PiCameraRotate } from "react-icons/pi";
import { useVideoDevices } from "../../../hooks/camera";
import useGame from "../../../stores/game";

interface GameFinishedDialogProps extends DialogProps {}

const GameFinishedDialog: FunctionComponent<GameFinishedDialogProps> = (
  props,
) => {
  const theme = useTheme();

  const game = useGame((state) => ({
    Exit: state.Exit,
  }));

  return (
    <>
      <Dialog {...props}>
        <DialogTitle textAlign="center" variant="h4">
          Game finished!
        </DialogTitle>

        <DialogContent sx={{}}>
          <Stack>
            {/* <Camera /> */}

            <textarea
              style={{
                height: 50,
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
              }}
              placeholder="Write a description"
              maxLength={1000}
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
            onClick={() => game.Exit()}
          >
            Submit and exit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Camera: FunctionComponent = () => {
  const theme = useTheme();

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

      // TODO
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

  if (!cameraDevices || cameraDevices.length === 0 || !!cameraError) {
    return null;
  }

  return (
    <Stack spacing={1} alignItems={"center"} sx={{ flex: 1 }}>
      <video
        id="video"
        autoPlay
        playsInline
        style={{
          borderRadius: theme.shape.borderRadius + "px",
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

      <Stack
        spacing={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box sx={{ width: "30%", textAlign: "left" }} />

        <Box sx={{ width: "40%" }}>
          <Fab onClick={takePicture} size="large" color="primary">
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
};

export default GameFinishedDialog;
