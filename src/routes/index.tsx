import { type FunctionComponent, Suspense } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes as RouterRoutes,
} from "react-router-dom";
import { useAssetsPreloader } from "../hooks/preloader";
import GameView from "../views/Game";
import LoginView from "../views/Login";
import NewGameView from "../views/Login/New";
import ResumeGameView from "../views/Login/Resume";
import SharedControlView from "../views/SharedControl";
import { GameGuard } from "./guard";

const Routes: FunctionComponent = () => {
  useAssetsPreloader();

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
            <Route path="resume" element={<ResumeGameView />} />
            <Route
              path="continue"
              element={<Navigate to="/login/resume" replace />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Route>

        <Route path="remote" element={<SharedControlView />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
