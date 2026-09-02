import { useMediaQuery, useTheme } from "@mui/material";
import {
  createContext,
  type FunctionComponent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TextFlashBanner, type TextFlashVariant } from "./banner";

interface TextFlashOptions {
  duration?: number;
  variant?: TextFlashVariant;
}

interface TextFlashItem {
  id: number;
  text: string;
  variant: TextFlashVariant;
  duration: number;
}

const TextFlashContext = createContext({
  flash: (text: string, options?: TextFlashOptions) => {},
  clear: () => {},
});

export const useTextFlash = () => {
  return useContext(TextFlashContext);
};

export interface TextFlashProviderProps {
  children: ReactNode | ReactNode[];
  duration?: number;
}

export const TextFlashProvider: FunctionComponent<TextFlashProviderProps> = ({
  duration = 1800,
  ...props
}) => {
  const [queue, setQueue] = useState<TextFlashItem[]>([]);
  const nextId = useRef(0);
  const theme = useTheme();
  // Flashy overlay banners are distracting/cramped on small screens, so we skip rendering them
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const flash = (text: string, options?: TextFlashOptions) => {
    setQueue((prev) => [
      ...prev,
      {
        id: nextId.current++,
        text,
        variant: options?.variant ?? "hype",
        duration: options?.duration ?? duration,
      },
    ]);
  };

  const clear = () => {
    setQueue([]);
  };

  const current = queue[0];

  // Advances the queue once the current message's own animation has had time to play out
  useEffect(() => {
    if (!current) {
      return;
    }

    const timeout = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, current.duration);

    return () => clearTimeout(timeout);
  }, [current?.id]);

  return (
    <TextFlashContext.Provider value={{ flash, clear }}>
      {current && !isMobile && (
        <TextFlashBanner
          key={current.id}
          text={current.text}
          variant={current.variant}
          durationMs={current.duration}
        />
      )}
      {props.children}
    </TextFlashContext.Provider>
  );
};
