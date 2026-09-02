import type { FunctionComponent } from "react";
import { toBase14 } from "../../utilities/base14";

interface Base14SipsProps {
  value: number;
  denotationOpacity?: number;
}

// Renders a sip count in base 14 with the "₁₄" denotation used across the app.
const Base14Sips: FunctionComponent<Base14SipsProps> = ({
  value,
  denotationOpacity = 1,
}) => {
  return (
    <>
      {toBase14(value)}
      <sub style={{ opacity: denotationOpacity }}>14</sub>
    </>
  );
};

export default Base14Sips;
