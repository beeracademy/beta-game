import { Box, Dialog } from "@mui/material";
import {
  type CSSProperties,
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Card, getCardImageURI } from "../../models/card";
import { suppressBleedThrough } from "./bleedSuppressor";

interface CardFlashDialogProps {
  open: boolean;
  card: Card;
  rankedPhoto?: string;
  onDismiss?: () => void;
}

const CardFlashDialog: FunctionComponent<CardFlashDialogProps> = ({
  open,
  card,
  rankedPhoto,
  onDismiss,
}) => {
  const [cardImageURI, setCardImageURI] = useState<string | undefined>(
    undefined,
  );
  // alternates each draw so the lay-down rotation direction feels random
  const [spinDir, setSpinDir] = useState(1);
  const [isDismissing, setIsDismissing] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsDismissing(false);
    setCardImageURI(getCardImageURI(card));
    setSpinDir(Math.random() < 0.5 ? -1 : 1);

    return () => {
      setCardImageURI(undefined);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [card]);

  const triggerDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    suppressBleedThrough(400);

    dismissTimerRef.current = setTimeout(() => {
      onDismiss?.();
    }, 100);
  }, [isDismissing, onDismiss]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerDismiss();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerDismiss();
  };

  return (
    <Dialog
      open={open}
      onClose={(_e, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          triggerDismiss();
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          },
        },
        paper: {
          sx: {
            border: "none",
            overflow: "visible",
            backgroundColor: "transparent",
            boxShadow: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          },
        },
      }}
    >
      {cardImageURI && (
        <Box
          // key forces a remount per card so the splash animation replays every draw
          key={cardImageURI}
          style={{ "--spin-dir": spinDir } as CSSProperties}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          <Box
            component="img"
            src={cardImageURI}
            height={350}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            sx={{
              backgroundColor: "#000",
              display: "block",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
              WebkitUserDrag: "none",
              WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
              animation: isDismissing
                ? "cardSplashOut 0.1s cubic-bezier(0.4, 0, 1, 1) forwards"
                : "cardSplashIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "@keyframes cardSplashIn": {
                "0%": {
                  transform:
                    "scale(0.3) rotate(calc(var(--spin-dir) * -12deg))",
                  opacity: 0,
                },
                "60%": {
                  transform: "scale(1) rotate(calc(var(--spin-dir) * 3deg))",
                  opacity: 1,
                },
                "80%": {
                  transform: "scale(1) rotate(calc(var(--spin-dir) * -1deg))",
                },
                "100%": {
                  transform: "scale(1) rotate(0deg)",
                  opacity: 1,
                },
              },
              "@keyframes cardSplashOut": {
                "0%": {
                  transform: "scale(1) rotate(0deg)",
                  opacity: 1,
                },
                "100%": {
                  transform:
                    "scale(0.85) rotate(calc(var(--spin-dir) * 4deg))",
                  opacity: 0,
                },
              },
            }}
          />
          {rankedPhoto && (
            // overlays the top-ranked player's avatar in the center of the face card,
            // matching the card's own splash-in animation
            <Box
              component="img"
              src={rankedPhoto}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              sx={{
                position: "absolute",
                width: "60%",
                height: "70%",
                objectFit: "cover",
                border: "1px solid #000",
                borderRadius: "4px",
                pointerEvents: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                WebkitUserDrag: "none",
                animation: isDismissing
                  ? "cardSplashOut 0.1s cubic-bezier(0.4, 0, 1, 1) forwards"
                  : "cardSplashIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          )}
        </Box>
      )}
    </Dialog>
  );
};

export { CardFlashDialog };
