import { FunctionComponent } from "react";
import { Navigate } from "react-router-dom";
import useGame from "../stores/game";

interface GameGuardProps {
    children: React.ReactNode | React.ReactNode[];
    started?: boolean;
}

const GameGuard: FunctionComponent<GameGuardProps> = (props) => {
    const game = useGame((state) => ({
        started: state.players.length > 0,
    }));

    if (props.started && !game.started) {
        return <Navigate to="/login" />;
    }

    if (!props.started && game.started) {
        return <Navigate to="/" />;
    }

    return <>{props.children}</>;
};

export { GameGuard };
