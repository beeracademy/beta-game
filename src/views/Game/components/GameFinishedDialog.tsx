import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent, memo, useEffect, useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsCamera, BsCameraVideoOff, BsTrophy } from "react-icons/bs";
import { IoClose, IoExitOutline } from "react-icons/io5";
import { MdRefresh } from "react-icons/md";
import { PiCameraRotate } from "react-icons/pi";
import { addPhoto } from "../../../api/endpoints/game";
import { useVideoDevices } from "../../../hooks/camera";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
import { useShallow } from "zustand/react/shallow";

interface GameFinishedDialogProps extends DialogProps {
  onClose?: () => void;
}

const GameFinishedDialog: FunctionComponent<GameFinishedDialogProps> = (
  props,
) => {
  const ref = useRef<FireworksHandlers>(null);

  const sounds = useSounds();

  const {
    savedDescription,
    setDescription,
    Exit,
    Submit,
    PlayAgain,
    submitted,
  } = useGame(
    useShallow((state) => ({
      savedDescription: state.description,
      setDescription: state.SetDescription,
      Exit: state.Exit,
      Submit: state.Submit,
      PlayAgain: state.PlayAgain,
      submitted: state.submitted,
    })),
  );

  const [description, setMessage] = useState(savedDescription || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // TODO: offline no longer bypasses picture/description, to make it testable locally
  const isDirectToChoices = Boolean(submitted);
  const [step, setStep] = useState<"summary" | "choices">(() =>
    isDirectToChoices ? "choices" : "summary",
  );

  useEffect(() => {
    if (isDirectToChoices) {
      setStep("choices");
    }
  }, [isDirectToChoices]);

  useEffect(() => {
    if (savedDescription !== undefined && savedDescription !== description) {
      setMessage(savedDescription);
    }
  }, [savedDescription]);

  const handleDescriptionChange = (value: string) => {
    setMessage(value);
    setDescription(value);
  };

  const cheeredRef = useRef(false);
  useEffect(() => {
    if (props.open && !cheeredRef.current) {
      cheeredRef.current = true;
      sounds.play("cheering");
    }
  }, [props.open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      sounds.play("click");
      await Submit({ description: description.trim() || undefined });
      setStep("choices");
    } catch (error) {
      console.error("[GameFinishedDialog] Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = async () => {
    setIsRestarting(true);
    try {
      sounds.stopAll();
      sounds.play("baladada");
      await PlayAgain();
      props.onClose?.();
    } catch (error) {
      console.error("[GameFinishedDialog] Failed to play again:", error);
      setIsRestarting(false);
    }
  };

  const handleExit = () => {
    sounds.play("click");
    Exit({
      dnf: false,
      description: description.trim() || undefined,
    });
    props.onClose?.();
  };

  const handleClose = () => {
    sounds.play("click");
    props.onClose?.();
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
            zIndex: 1300,
            pointerEvents: "none",
          }}
        />
      )}

      <Dialog
        {...props}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              position: "relative",
              maxWidth: 520,
              overflow: "hidden",
            },
          },
        }}
      >
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "text.secondary",
            zIndex: 10,
            "&:hover": {
              color: "text.primary",
            },
          }}
        >
          <IoClose size={22} />
        </IconButton>

        <Stack spacing={0.5} sx={{ alignItems: "center", pt: 3, pb: 1, px: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.5,
              py: 0.4,
              borderRadius: 4,
              backgroundColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(218, 175, 87, 0.12)"
                  : "rgba(218, 175, 87, 0.2)",
              color: "#daaf57",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            <BsTrophy size={13} />
            <span>Game Complete</span>
          </Box>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            {step === "choices" ? "Game Finished!" : "Victory Celebration"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {step === "choices"
              ? "What would you like to do next?"
              : "Capture the moment to commemorate the game"}
          </Typography>
        </Stack>

        {step === "summary" ? (
          <>
            <DialogContent
              sx={{
                padding: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Camera />

              <Box
                sx={{
                  width: "100%",
                  maxWidth: 480,
                  px: { xs: 2, sm: 3 },
                  pb: 0,
                  pt: 1.5,
                  boxSizing: "border-box",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add game notes or victory message... (optional)"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.03)"
                          : "rgba(0, 0, 0, 0.02)",
                      "& fieldset": {
                        borderColor: "divider",
                      },
                      "&:hover fieldset": {
                        borderColor: "text.secondary",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                pb: 2.5,
                pt: 1.5,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogActions>
          </>
        ) : (
          <DialogContent
            sx={{
              px: { xs: 2, sm: 4 },
              pt: 2,
              pb: 3.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Stack spacing={2} sx={{ width: "100%", maxWidth: 440 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isRestarting}
                startIcon={
                  isRestarting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <MdRefresh size={22} />
                  )
                }
                onClick={handlePlayAgain}
              >
                {isRestarting
                  ? "Starting new game..."
                  : "Play again with the same people!"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<IoExitOutline size={20} />}
                onClick={handleExit}
              >
                Exit Game
              </Button>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

const Camera: FunctionComponent = memo(() => {
  const theme = useTheme();
  const { devices: cameraDevices } = useVideoDevices();

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(0);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(
    null,
  );

  const game = useGame(
    useShallow((state) => ({
      gameToken: state.token,
      gameId: state.id,
      offline: state.offline,
      savedImage: state.image,
      setImage: state.SetImage,
    })),
  );

  const sounds = useSounds();

  const [image, setImage] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    game.savedImage || null,
  );
  const [countDown, setCountDown] = useState<number | undefined>();
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countDownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const isCountingDown = countDown !== undefined;
  const hasMultipleCameras = Boolean(cameraDevices && cameraDevices.length > 1);

  useEffect(() => {
    if (game.savedImage && !imageUrl) {
      setImageUrl(game.savedImage);
    }
  }, [game.savedImage]);

  // Create preview URL for captured blob and revoke when updated/unmounted
  useEffect(() => {
    if (!image) {
      if (!game.savedImage) {
        setImageUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(image);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image, game.savedImage]);

  // Clean up countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countDownIntervalRef.current) {
        clearInterval(countDownIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraLoading(true);
    setCameraError(null);
    setVideoAspectRatio(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported on this device");
      setCameraLoading(false);
      return;
    }

    try {
      let videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };

      if (cameraDevices && cameraDevices.length > 0) {
        const device =
          cameraDevices[selectedDeviceIndex % cameraDevices.length];
        if (device?.deviceId) {
          videoConstraints = {
            deviceId: { ideal: device.deviceId },
            facingMode: { ideal: facingMode },
          };
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setCameraLoading(false);
    } catch (error) {
      console.error("[Camera] Error accessing camera:", error);
      setCameraError("Could not access camera");
      setCameraLoading(false);
    }
  };

  // Manage camera stream lifecycle
  useEffect(() => {
    if (imageUrl) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode, selectedDeviceIndex, cameraDevices, imageUrl]);

  const capture = async () => {
    sounds.play("camera_shutter");

    // Screen flash white
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 600);

    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setImageUrl(dataUrl);
      game.setImage(dataUrl);
    } catch (e) {
      console.error("[Camera] Failed to generate data URL:", e);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        return;
      }

      setImage(blob);

      if (!game.offline && game.gameToken && game.gameId) {
        try {
          await addPhoto(game.gameToken, game.gameId, blob);
        } catch (error) {
          console.error("[Camera] Failed to upload photo:", error);
        }
      }
    });
  };

  const takePicture = () => {
    if (isCountingDown || !streamRef.current) {
      return;
    }

    setCountDown(3);

    const interval = setInterval(() => {
      setCountDown((prev) => {
        if (prev === undefined) {
          return undefined;
        }

        if (prev === 1) {
          clearInterval(interval);
          countDownIntervalRef.current = null;
          setCountDown(undefined);
          capture();
          return undefined;
        }

        return prev - 1;
      });
    }, 1000);

    countDownIntervalRef.current = interval;
  };

  const removePicture = () => {
    setImage(null);
    setImageUrl(null);
    game.setImage(null);
  };

  const changeCamera = () => {
    const nextFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacingMode);

    if (cameraDevices && cameraDevices.length > 1) {
      setSelectedDeviceIndex((prev) => (prev + 1) % cameraDevices.length);
    }
  };

  const isCameraUnavailable = Boolean(!imageUrl && (cameraError || (!cameraLoading && cameraDevices && cameraDevices.length === 0)));

  return (
    <>
      {/* Full screen flash white on photo capture */}
      {isFlashing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#ffffff",
            zIndex: 99999,
            pointerEvents: "none",
            animation: "screenFlashFade 0.6s ease-out forwards",
            "@keyframes screenFlashFade": {
              "0%": { opacity: 1 },
              "100%": { opacity: 0 },
            },
          }}
        />
      )}

      <Stack
        spacing={1.5}
        sx={{
          alignItems: "center",
          width: "100%",
          px: { xs: 2, sm: 3 },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 480,
            aspectRatio: videoAspectRatio ?? 4 / 3,
            maxHeight: { xs: "36vh", sm: "360px" },
            overflow: "hidden",
            position: "relative",
            borderRadius: 3,
            backgroundColor: (t) =>
              t.palette.mode === "dark" ? "#111116" : "#1a1a20",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Countdown indicator */}
          {countDown !== undefined && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 10,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: { xs: 90, sm: 130 },
                fontWeight: 900,
                color: "#ffffff",
                textShadow:
                  "0 0 25px rgba(0,0,0,0.9), 0 0 50px rgba(0,0,0,0.8)",
                WebkitTextStroke: "2px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                animation: "countdownPop 1s ease-in-out infinite",
                "@keyframes countdownPop": {
                  "0%": { transform: "scale(1.25)", opacity: 0.8 },
                  "50%": { transform: "scale(1)", opacity: 1 },
                  "100%": { transform: "scale(0.9)", opacity: 0.9 },
                },
              }}
            >
              {countDown}
            </Box>
          )}

          {/* Captured photo preview */}
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt="Game victory photo"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}

          {/* Live camera video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              if (video.videoWidth && video.videoHeight) {
                setVideoAspectRatio(video.videoWidth / video.videoHeight);
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: imageUrl || isCameraUnavailable ? "none" : "block",
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />

          {/* Loading state */}
          {!imageUrl && cameraLoading && !cameraError && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
            >
              <CircularProgress size={36} color="primary" />
              <Typography variant="caption" color="text.secondary">
                Connecting to camera...
              </Typography>
            </Box>
          )}

          {/* Redesigned Camera Unavailable Screen */}
          {isCameraUnavailable && (
            <Stack
              spacing={1.5}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
                textAlign: "center",
                background:
                  "radial-gradient(ellipse at center, rgba(35, 35, 48, 0.95) 0%, rgba(18, 18, 24, 0.98) 100%)",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "text.secondary",
                  boxShadow: "none",
                }}
              >
                <BsCameraVideoOff size={32} />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Camera Unavailable
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 280, mt: 0.5, fontSize: "0.85rem", lineHeight: 1.4 }}
                >
                  {cameraError || "No webcam detected on this device."}
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<MdRefresh size={18} />}
                onClick={startCamera}
                sx={{
                  mt: 0.5,
                  borderRadius: 2,
                  textTransform: "none",
                  borderColor: "divider",
                  fontSize: "0.8rem",
                  py: 0.5,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Try Again
              </Button>
            </Stack>
          )}
        </Box>

        {/* Camera action bar */}
        {!isCameraUnavailable && (
          <Stack
            direction="row"
            sx={{
              width: "100%",
              maxWidth: 480,
              alignItems: "center",
              justifyContent: "space-between",
              pt: 0.5,
            }}
          >
            {/* Left side spacer to keep shutter centered */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
              {hasMultipleCameras && <Box sx={{ width: 44 }} />}
            </Box>

            {/* Center action button */}
            <Box sx={{ flex: "0 0 auto" }}>
              {imageUrl ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<AiOutlineDelete size={18} />}
                  onClick={removePicture}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2.5,
                    py: 0.8,
                    borderColor: "divider",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                      backgroundColor: "rgba(234, 118, 99, 0.08)",
                      boxShadow: "none",
                    },
                  }}
                >
                  Retake Photo
                </Button>
              ) : (
                <Box
                  component="button"
                  onClick={takePicture}
                  disabled={isCountingDown || cameraLoading}
                  aria-label="Take picture"
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    border: "3px solid rgba(255, 255, 255, 0.85)",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    p: 0.5,
                    outline: "none",
                    transition: "transform 0.15s ease, opacity 0.15s ease",
                    "&:hover": {
                      transform: "scale(1.06)",
                    },
                    "&:active": {
                      transform: "scale(0.94)",
                    },
                    "&:disabled": {
                      opacity: 0.4,
                      cursor: "not-allowed",
                      transform: "none",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <BsCamera size={26} />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Right side: camera flip button (ONLY if multiple cameras exist) */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {hasMultipleCameras && !imageUrl && (
                <IconButton
                  onClick={changeCamera}
                  disabled={isCountingDown || cameraLoading}
                  aria-label="Flip camera"
                  title={
                    facingMode === "user"
                      ? "Switch to back camera"
                      : "Switch to front camera"
                  }
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                  }}
                >
                  <PiCameraRotate size={22} />
                </IconButton>
              )}
            </Box>
          </Stack>
        )}
      </Stack>
    </>
  );
});

export default GameFinishedDialog;
