import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { GameGuard } from "./guard";
import useGame, { createInitialGameState } from "../stores/game";

describe("GameGuard", () => {
  beforeEach(() => {
    useGame.setState(createInitialGameState());
  });

  it("redirects to /login when game has not started but started=true is required", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <GameGuard started={true}>
                <div>Game Content</div>
              </GameGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Game Content")).not.toBeInTheDocument();
  });

  it("renders protected content when game has started and started=true", () => {
    useGame.setState({ gameStartTimestamp: 12345 });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <GameGuard started={true}>
                <div>Game Content</div>
              </GameGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Game Content")).toBeInTheDocument();
  });

  it("redirects to / when game has already started and started=false (visiting login)", () => {
    useGame.setState({ gameStartTimestamp: 12345 });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GameGuard started={false}>
                <div>Login Page</div>
              </GameGuard>
            }
          />
          <Route path="/" element={<div>Game Content</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Game Content")).toBeInTheDocument();
  });
});
