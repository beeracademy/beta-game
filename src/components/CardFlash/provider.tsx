import {
  createContext,
  type FunctionComponent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Card } from "../../models/card";
import useRankedCards from "../../stores/rankedCards";
import { CardFlashDialog } from "./dialog";

interface CardFlashContextType {
  show: boolean;
  flash: (newCard: Card, options?: flashCardOptions) => void;
  hide: () => void;
  wasRecentlyDismissed: () => boolean;
}

const CardFlashContext = createContext<CardFlashContextType>({
  show: false,
  flash: (_card: Card, _options?: flashCardOptions) => {},
  hide: () => {},
  wasRecentlyDismissed: () => false,
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
  const lastDismissedAtRef = useRef(0);

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

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    lastDismissedAtRef.current = Date.now();
    setShow(false);
    setCard(undefined);
  }, []);

  const flash = useCallback(
    (newCard: Card, options?: flashCardOptions) => {
      setCard(newCard);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        hide();
      }, options?.duration || duration);

      setShow(true);
    },
    [duration, hide],
  );

  const wasRecentlyDismissed = useCallback(() => {
    return Date.now() - lastDismissedAtRef.current < 400;
  }, []);

  return (
    <CardFlashContext.Provider
      value={{
        show,
        flash,
        hide,
        wasRecentlyDismissed,
      }}
    >
      {card && (
        <CardFlashDialog
          open={show}
          card={card}
          rankedPhoto={rankedCards[`${card.suit}-${card.value}`]?.user_image}
          onDismiss={hide}
        />
      )}
      {props.children}
    </CardFlashContext.Provider>
  );
};
