import { Box, Dialog } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Card, getCardImageURI } from "../../models/card";

interface CardFlashDialogProps {
  open: boolean;
  card: Card;
}

const CardFlashDialog: FunctionComponent<CardFlashDialogProps> = ({
  open,
  card,
}) => {
  const [cardImageURI, setCardImageURI] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setCardImageURI(getCardImageURI(card));

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
            borderRadius: "12px",
            border: "none",
            overflow: "hidden",
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
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: "140%",
              height: "140%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
              animation: "cardSplashGlow 0.5s ease-out",
              "@keyframes cardSplashGlow": {
                "0%": { transform: "scale(0.2)", opacity: 0.9 },
                "100%": { transform: "scale(1.4)", opacity: 0 },
              },
            }}
          />
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
                  transform: "scale(0.3) rotate(-10deg)",
                  opacity: 0,
                },
                "60%": {
                  transform: "scale(1.08) rotate(3deg)",
                  opacity: 1,
                },
                "80%": {
                  transform: "scale(0.96) rotate(-1deg)",
                },
                "100%": {
                  transform: "scale(1) rotate(0deg)",
                  opacity: 1,
                },
              },
            }}
          />
        </Box>
      )}
    </Dialog>
  );
};

export { CardFlashDialog };
