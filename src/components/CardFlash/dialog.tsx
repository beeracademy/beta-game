import { Dialog } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { Card, getCardImageURI } from "../../models/card";

interface CardFlashDialogProps {
    open: boolean;
    card: Card;
}

const CardFlashDialog: FunctionComponent<CardFlashDialogProps> = (props) => {
    const [cardImageURI, setCardImageURI] = useState<string | undefined>(undefined);

    useEffect(() => {
        setCardImageURI(getCardImageURI(props.card));

        return () => {
            setCardImageURI(undefined);
        };
    }, [props.card]);

    return (
        <Dialog open={props.open} hideBackdrop>
            {cardImageURI && <img src={cardImageURI} height={300} />}
        </Dialog>
    );
};

export { CardFlashDialog };
