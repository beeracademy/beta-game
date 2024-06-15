import {
  Box,
  Dialog,
  DialogContent,
  Fab,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { BsArrowLeftShort, BsCamera } from "react-icons/bs";
import { PiCameraRotate } from "react-icons/pi";
import { useVideoDevices } from "../../../hooks/camera";

interface PictureDialogProps {
  open: boolean;
  onClose(): void;
  onPicture(image: Blob): void;
}

const PictureDialog: FunctionComponent<PictureDialogProps> = ({
  open,
  onClose,
  onPicture,
}) => {
  const theme = useTheme();

  const devices = useVideoDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null,
  );

  const hasNoDevices = devices && devices.length === 0;
  const hasMultipleDevices = devices && devices.length > 1;

  const [countdown, setCountdown] = useState<number | null>(1);

  useEffect(() => {
    if (devices) {
      setSelectedDevice(devices[0]);
    }
  }, [devices]);

  const doCountdown = async () => {
    return new Promise<void>((resolve) => {
      setCountdown(3000);

      const interval = setInterval(() => {
        setCountdown((countdown) => {
          if (countdown === 1) {
            clearInterval(interval);
            resolve();
            return null;
          }

          return (countdown as number) - 1;
        });
      }, 1000);
    });
  };

  const takePicture = async () => {
    if (!selectedDevice) {
      return;
    }

    await doCountdown();

    const video = document.querySelector("video") as HTMLVideoElement;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onPicture(blob);
      }
    });
  };

  // TODO loading camera placeholder
  // TODO support for camera permissions
  // TODO support no camera

  const changeCamera = () => {
    if (!devices) {
      return;
    }

    const currentIndex = devices.findIndex(
      (device) => device.deviceId === selectedDevice?.deviceId,
    );

    const nextIndex = (currentIndex + 1) % devices.length;

    setSelectedDevice(devices[nextIndex]);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        sx={{
          textAlign: "center",
          width: 500,
        }}
      >
        <Stack spacing={1} alignItems={"center"}>
          <video
            id="video"
            autoPlay
            playsInline
            width={"100%"}
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
            width={"100%"}
          >
            <Box sx={{ width: "30%", textAlign: "left" }}>
              <IconButton onClick={onClose}>
                <BsArrowLeftShort size={32} />
              </IconButton>
            </Box>

            <Box sx={{ width: "40%" }}>
              <Fab onClick={takePicture} size="large" color="primary">
                <BsCamera size={32} />
              </Fab>
            </Box>

            <Box sx={{ width: "30%" }}>
              <IconButton
                onClick={changeCamera}
                sx={{
                  display:
                    hasNoDevices || !hasMultipleDevices ? "none" : undefined,
                }}
              >
                <PiCameraRotate size={32} />
              </IconButton>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PictureDialog;
