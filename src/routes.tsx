import { FunctionComponent, Suspense } from "react";
import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";
import GameView from "./views/Game";
import LoginView from "./views/Login";
import ContinueGameView from "./views/Login/Continue";
import NewGameView from "./views/Login/New";

const Routes: FunctionComponent = () => {
    return (
        <Suspense>
            <RouterRoutes>
                <Route path="/" element={<GameView />} />

                <Route path="/login" element={<LoginView />}>
                    <Route path="" element={<NewGameView />} />
                    <Route path="continue" element={<ContinueGameView />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </RouterRoutes>
        </Suspense>
    );
};

export default Routes;
