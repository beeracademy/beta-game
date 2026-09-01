import { FunctionComponent } from "react";
import { Navigate } from "react-router-dom";
import useGame from "../stores/game";

interface GameGuardProps {
  children: React.ReactNode | React.ReactNode[];
  started?: boolean;
}

const GameGuard: FunctionComponent<GameGuardProps> = (props) => {
  const started = useGame((state) => !!state.gameStartTimestamp);

  if (props.started && !started) {
    return <Navigate to="/login" />;
  }

  if (!props.started && started) {
    return <Navigate to="/" />;
  }

  return <>{props.children}</>;
};

export { GameGuard };
