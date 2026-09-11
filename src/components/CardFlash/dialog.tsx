import { Box, Dialog } from "@mui/material";
import {
  type CSSProperties,
  type FunctionComponent,
  useEffect,
  useState,
} from "react";
import { type Card, getCardImageURI } from "../../models/card";

interface CardFlashDialogProps {
  open: boolean;
  card: Card;
  rankedPhoto?: string;
}

const CardFlashDialog: FunctionComponent<CardFlashDialogProps> = ({
  open,
  card,
  rankedPhoto,
}) => {
  const [cardImageURI, setCardImageURI] = useState<string | undefined>(
    undefined,
  );
  // alternates each draw so the lay-down rotation direction feels random
  const [spinDir, setSpinDir] = useState(1);

  useEffect(() => {
    setCardImageURI(getCardImageURI(card));
    setSpinDir(Math.random() < 0.5 ? -1 : 1);

    return () => {
      setCardImageURI(undefined);
    };
  }, [card]);

  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            border: "none",
            overflow: "visible",
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        },
      }}
    >
      {cardImageURI && (
        <Box
          // key forces a remount per card so the splash animation replays every draw
          key={cardImageURI}
          style={{ "--spin-dir": spinDir } as CSSProperties}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={cardImageURI}
            height={350}
            sx={{
              backgroundColor: "#000",
              display: "block",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              animation: "cardSplashIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
            }}
          />
          {rankedPhoto && (
            // overlays the top-ranked player's avatar in the center of the face card,
            // matching the card's own splash-in animation
            <Box
              component="img"
              src={rankedPhoto}
              sx={{
                position: "absolute",
                width: "60%",
                height: "70%",
                objectFit: "cover",
                border: "1px solid #000",
                borderRadius: "4px",
                pointerEvents: "none",
                animation:
                  "cardSplashIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          )}
        </Box>
      )}
    </Dialog>
  );
};

export { CardFlashDialog };
