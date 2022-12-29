import { FunctionComponent, Suspense } from "react";
import { Navigate, Outlet, Route, Routes as RouterRoutes } from "react-router-dom";
import GameView from "../views/Game";
import LoginView from "../views/Login";
import ContinueGameView from "../views/Login/Continue";
import NewGameView from "../views/Login/New";
import RemoteView from "../views/Remote";
import { GameGuard } from "./guard";

const Routes: FunctionComponent = () => {
    return (
        <Suspense>
            <RouterRoutes>
                <Route
                    element={
                        <GameGuard started={true}>
                            <Outlet />
                        </GameGuard>
                    }
                >
                    <Route path="" element={<GameView />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Route>

                <Route
                    element={
                        <GameGuard started={false}>
                            <Outlet />
                        </GameGuard>
                    }
                >
                    <Route path="login" element={<LoginView />}>
                        <Route path="" element={<NewGameView />} />
                        <Route path="continue" element={<ContinueGameView />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" />} />
                </Route>

                <Route path="remote" element={<RemoteView />} />
            </RouterRoutes>
        </Suspense>
    );
};

export default Routes;
