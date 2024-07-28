import {
  FunctionComponent,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { Card } from "../../models/card";
import { CardFlashDialog } from "./dialog";

const CardFlashContext = createContext({
  show: false,
  flash: (card: Card, options?: flashCardOptions) => {},
  hide: () => {},
});

export const useCardFlash = () => {
  return useContext(CardFlashContext);
};

export interface CardFlashProviderProps {
  children: ReactNode | ReactNode[];
  duration?: number;
}

export interface flashCardOptions {
  duration?: number;
}

export const CardFlashProvider: FunctionComponent<CardFlashProviderProps> = ({
  duration = 750,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [card, setCard] = useState<Card>();
  const [_, setTimeoutRef] = useState<ReturnType<typeof setInterval>>();

  const flash = (card: Card, options?: flashCardOptions) => {
    setCard(card);

    setTimeoutRef((prev) => {
      prev && clearTimeout(prev);
      return setTimeout(() => {
        setShow(false);
      }, options?.duration || duration);
    });

    setShow(true);
  };

  const hide = () => {
    setShow(false);
  };

  return (
    <CardFlashContext.Provider
      value={{
        show,
        flash,
        hide,
      }}
    >
      {card && <CardFlashDialog open={show} card={card} />}
      {props.children}
    </CardFlashContext.Provider>
  );
};
