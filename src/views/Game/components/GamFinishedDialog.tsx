import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";
import {
  Box,
  Button,
  CircularProgress,
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
import { AiOutlineDelete } from "react-icons/ai";
import { BsCamera } from "react-icons/bs";
import { FaArrowsRotate } from "react-icons/fa6";
import { addPhoto } from "../../../api/endpoints/game";
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
            minWidth: 600,
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
          <Camera />

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
  const MaxWidth = 600;
  const MaxHeight = 500;

  const { devices: cameraDevices, error: cameraError } = useVideoDevices();

  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null,
  );

  const [selectedDeviceSize, setSelectedDeviceSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const hasNoDevices = cameraDevices && cameraDevices.length === 0;
  const hasMultipleDevices = cameraDevices && cameraDevices.length > 1;

  const [image, setImage] = useState<Blob | null>(null);
  const [countDown, setCountDown] = useState<number | undefined>();

  const isCountingDown = countDown !== undefined;

  const game = useGame((state) => ({
    gameToken: state.token,
    gameId: state.id,
  }));

  const sounds = useSounds();

  useEffect(() => {
    if (!cameraDevices || cameraDevices.length === 0) {
      return;
    }

    if (selectedDevice) {
      return;
    }

    selectDevice(cameraDevices[0]);
  }, [cameraDevices]);

  const selectDevice = async (device: MediaDeviceInfo) => {
    const meta = await getDeviceCapabilities(device.deviceId);
    const size = getScaledViewSize(meta.width, meta.height);

    setSelectedDeviceSize(size);
    setSelectedDevice(device);
  };

  const getDeviceCapabilities = async (id: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: id,
      },
    });

    const track = stream.getVideoTracks()[0];

    return track.getSettings();
  };

  let countDownInterval: number;
  const takePicture = () => {
    if (!selectedDevice || isCountingDown) {
      return;
    }

    setCountDown(3);
    countDownInterval = setInterval(() => {
      setCountDown((prev) => {
        if (prev === undefined) {
          return undefined;
        }

        if (prev === 1) {
          setCountDown(undefined);
          clearInterval(countDownInterval);
          capture();

          return undefined;
        }

        return prev - 1;
      });
    }, 1000);

    const capture = async () => {
      sounds.play("camera_shutter");

      const video = document.querySelector("video") as HTMLVideoElement;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob || !game.gameToken || !game.gameId) {
          return;
        }

        setImage(blob);

        await addPhoto(game.gameToken, game.gameId, blob);
      });
    };
  };

  const removePicture = () => {
    setImage(null);
  };

  const changeCamera = async () => {
    if (!cameraDevices) {
      return;
    }

    const currentIndex = cameraDevices.findIndex(
      (d) => d.deviceId === selectedDevice?.deviceId,
    );

    const nextIndex = (currentIndex + 1) % cameraDevices.length;

    const device = cameraDevices[nextIndex];

    selectDevice(device);
  };

  const getScaledViewSize = (width?: number, height?: number) => {
    if (!width || !height) {
      return {
        width: 0,
        height: 0,
      };
    }

    const ratio = Math.min(MaxWidth / width, MaxHeight / height);

    return {
      width: width * ratio,
      height: height * ratio,
    };
  };

  if (!!cameraError) {
    return null;
  }

  return (
    <Stack spacing={1} alignItems={"center"}>
      <Box
        sx={{
          height: selectedDeviceSize?.height || 400,
          width: selectedDeviceSize?.width || 500,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 140,
            fontWeight: "bold",
            color: "white",
            WebkitTextStrokeWidth: "2px",
            WebkitTextStrokeColor: "black",
            MozTextStrokeWidth: "2px",
            MozTextStrokeColor: "black",
          }}
        >
          {countDown}
        </Box>

        {image && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              background: `url(${URL.createObjectURL(image)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {selectedDevice && <Video device={selectedDevice} />}

        {!selectedDevice && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.5,
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        )}
      </Box>

      <Stack
        spacing={1}
        direction="row"
        sx={{
          width: "100%",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            flex: 1,
          }}
        />

        <Box sx={{ flex: 0 }}>
          <Fab
            onClick={image ? removePicture : takePicture}
            size="large"
            color={image ? "default" : "primary"}
            disabled={!selectedDevice || isCountingDown}
          >
            {image ? <AiOutlineDelete size={32} /> : <BsCamera size={32} />}
          </Fab>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
          }}
        >
          <IconButton
            onClick={changeCamera}
            sx={{
              height: 48,
              width: 48,
              display: hasNoDevices || !hasMultipleDevices ? "none" : undefined,
            }}
          >
            <FaArrowsRotate size={24} />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
});

interface VideoProps {
  device: MediaDeviceInfo | null;
}

const Video: FunctionComponent<VideoProps> = memo(({ device }) => {
  return (
    <video
      id="video"
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        transform: "scaleX(-1)",
      }}
      ref={(video) => {
        if (video && device) {
          navigator.mediaDevices
            .getUserMedia({
              video: {
                deviceId: device.deviceId,
              },
            })
            .then((stream) => {
              video.srcObject = stream;
            });
        }
      }}
    />
  );
});

export default GameFinishedDialog;
