import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoGameController } from "react-icons/io5";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useSounds } from "../../../hooks/sounds";
import useGamesPlayed from "../../../stores/gamesPlayed";

const LONG_PRESS_MS = 1500;

const BottomGamesCount: FunctionComponent = () => {
  const { started, completed, reset } = useGamesPlayed();
  const sounds = useSounds();
  const theme = useTheme();

  const [isPressing, setIsPressing] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    startPosRef.current = null;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || dialogOpen) return;
    cancelPress();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setIsPressing(true);

    timerRef.current = setTimeout(() => {
      setIsPressing(false);
      setIsPopping(true);
      sounds.play("pop");

      popTimerRef.current = setTimeout(() => {
        setIsPopping(false);
      }, 400);

      dialogTimerRef.current = setTimeout(() => {
        setDialogOpen(true);
      }, 200);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current || !isPressing) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (Math.hypot(dx, dy) > 10) {
      cancelPress();
    }
  };

  const handlePointerUp = () => {
    cancelPress();
  };

  const handlePointerLeave = () => {
    cancelPress();
  };

  const handlePointerCancel = () => {
    cancelPress();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
    };
  }, []);

  const activeColor = theme.palette.error.main;
  const defaultColor = theme.palette.text.secondary;

  return (
    <>
      <Box
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        onContextMenu={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: 1.5,
          pb: 0.5,
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          cursor: "pointer",
        }}
      >
        <motion.div
          animate={
            isPopping
              ? { scale: [1, 1.25, 0.95, 1] }
              : { scale: 1 }
          }
          transition={
            isPopping
              ? { duration: 0.35, ease: "easeOut" }
              : { duration: 0.2, ease: "easeOut" }
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color:
              isPressing || isPopping ? activeColor : defaultColor,
            opacity: isPressing || isPopping ? 1 : 0.75,
            transition: isPressing
              ? `color ${LONG_PRESS_MS}ms linear, opacity ${LONG_PRESS_MS}ms linear`
              : "color 0.3s ease-out, opacity 0.3s ease-out",
          }}
        >
          <Typography
            sx={{ fontSize: { xs: 12, sm: 13 }, lineHeight: 1 }}
            color="inherit"
            align="center"
          >
            {started} {started > 1 ? "games" : "game"} started and {completed}{" "}
            completed on this computer
          </Typography>
          <IoGameController
            size={14}
            style={{ color: "inherit", flexShrink: 0, display: "inline-block" }}
          />
        </motion.div>
      </Box>

      <ConfirmDialog
        open={dialogOpen}
        title="Reset counter"
        message="Do you want to reset the counter?"
        onConfirm={() => {
          reset();
          setDialogOpen(false);
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
};

export default BottomGamesCount;
