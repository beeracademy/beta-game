import {
  useState,
  useContext,
  FunctionComponent,
  ReactNode,
  createContext,
} from "react";
import { Card } from "../../models/card";
import { CardFlashDialog } from "./dialog";

const CardFlashContext = createContext({
  show: false,
  flashCard: (card: Card, options?: flashCardOptions) => {},
});

export const useCardFlash = () => {
  return useContext(CardFlashContext).flashCard;
};

export interface CardFlashProviderProps {
  children: ReactNode | ReactNode[];
  duration?: number;
}

export interface flashCardOptions {
  duration?: number;
}

export const CardFlashProvider: FunctionComponent<CardFlashProviderProps> = (
  props
) => {
  const [show, setShow] = useState(false);
  const [card, setCard] = useState<Card>();
  const [_, setTimeoutRef] = useState<ReturnType<typeof setInterval>>();

  const flashCard = (card: Card, options?: flashCardOptions) => {
    setCard(card);

    setTimeoutRef((prev) => {
      prev && clearTimeout(prev);
      return setTimeout(() => {
        setShow(false);
      }, options?.duration || props.duration);
    });

    setShow(true);
  };

  return (
    <CardFlashContext.Provider
      value={{
        show,
        flashCard,
      }}
    >
      {card && <CardFlashDialog open={show} card={card} />}
      {props.children}
    </CardFlashContext.Provider>
  );
};

CardFlashProvider.defaultProps = {
  duration: 500,
};
