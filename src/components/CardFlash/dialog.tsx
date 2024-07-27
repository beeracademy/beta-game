import { Dialog } from "@mui/material";
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
    <Dialog open={open}>
      {cardImageURI && (
        <img
          src={cardImageURI}
          height={350}
          style={{
            backgroundColor: "#000",
          }}
        />
      )}
    </Dialog>
  );
};

export { CardFlashDialog };
