import type { CSSProperties, FunctionComponent } from "react";
import { toBase14 } from "../../utilities/base14";

interface Base14SipsProps {
  value: number;
  denotationOpacity?: number;
  denotationFontSize?: string | number;
  denotationStyle?: CSSProperties;
}

// Renders a sip count in base 14 with the "₁₄" denotation used across the app.
const Base14Sips: FunctionComponent<Base14SipsProps> = ({
  value,
  denotationOpacity = 1,
  denotationFontSize,
  denotationStyle,
}) => {
  return (
    <>
      {toBase14(value)}
      <sub
        style={{
          opacity: denotationOpacity,
          ...(denotationFontSize !== undefined
            ? { fontSize: denotationFontSize }
            : {}),
          ...denotationStyle,
        }}
      >
        14
      </sub>
    </>
  );
};

export default Base14Sips;
