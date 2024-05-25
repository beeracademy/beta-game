import { FunctionComponent } from "react";
import { getCardImageURI } from "../../../models/card";
import { useGameMetrics } from "../../../stores/metrics";

interface LastCardDrawnProps {
  width?: number;
  height?: number;
}

const LastCardDrawn: FunctionComponent<LastCardDrawnProps> = (props) => {
  const metrics = useGameMetrics();

  return (
    <img
      src={getCardImageURI(metrics.latestCard)}
      width={props.width}
      height={props.height}
    />
  );
};

LastCardDrawn.defaultProps = {
  width: 300,
};

export default LastCardDrawn;
