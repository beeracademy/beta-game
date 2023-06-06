import { FunctionComponent } from "react";
import { getCardImageURI } from "../../../models/card";
import useGame from "../../../stores/game";

interface LastCardDrawnProps {
  width?: number;
  height?: number;
}

const LastCardDrawn: FunctionComponent<LastCardDrawnProps> = (props) => {
  const game = useGame((state) => ({
    draws: state.draws,
  }));

  return (
    <img
      src={getCardImageURI(game.draws[game.draws.length - 1])}
      width={props.width}
      height={props.height}
    />
  );
};

LastCardDrawn.defaultProps = {
  width: 300,
};

export default LastCardDrawn;
