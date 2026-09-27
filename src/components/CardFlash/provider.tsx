import {
  createContext,
  type FunctionComponent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Card } from "../../models/card";
import useRankedCards from "../../stores/rankedCards";
import { CardFlashDialog } from "./dialog";

const CardFlashContext = createContext({
  show: false,
  flash: (_card: Card, _options?: flashCardOptions) => {},
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
  duration = 1500,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [card, setCard] = useState<Card>();
  const rankedCards = useRankedCards((state) => state.rankedCards);
  const fetchRankedCards = useRankedCards((state) => state.fetchRankedCards);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRankedCards();
  }, [fetchRankedCards]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const flash = (newCard: Card, options?: flashCardOptions) => {
    setCard(newCard);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShow(false);
      setCard(undefined);
    }, options?.duration || duration);

    setShow(true);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
    setCard(undefined);
  };

  return (
    <CardFlashContext.Provider
      value={{
        show,
        flash,
        hide,
      }}
    >
      {card && (
        <CardFlashDialog
          open={show}
          card={card}
          rankedPhoto={rankedCards[`${card.suit}-${card.value}`]?.user_image}
        />
      )}
      {props.children}
    </CardFlashContext.Provider>
  );
};
