import { FunctionComponent } from "react";
import { getCardImageURI } from "../../../models/card";
import { useGameMetrics } from "../../../stores/metrics";

interface LastCardDrawnProps {
  width?: number;
  height?: number;
}

const LastCardDrawn: FunctionComponent<LastCardDrawnProps> = ({
  width = 300,
  height,
}) => {
  const metrics = useGameMetrics();

  return (
    <img
      src={getCardImageURI(metrics.latestCard)}
      width={width}
      height={height}
    />
  );
};

export default LastCardDrawn;
