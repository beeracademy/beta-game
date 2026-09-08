import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import { SharedControlProvider } from "../../../stores/sharedControl";
import Header from "./Header";

vi.mock("../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      players: [
        { id: 1, username: "Alice", token: "tok1" },
        { id: 2, username: "Bob", token: "tok2" },
      ],
      draws: [],
      numberOfRounds: 1,
      offline: false,
      gameStartTimestamp: Date.now(),
      turnStartTimestamp: Date.now(),
    });
  });

  it("renders shared control and exit game buttons for the host (non-remote)", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /shared control settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /abandon game|exit game/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark players as 'did not finish'/i }),
    ).toBeInTheDocument();
  });

  it("does not render shared control and exit game buttons when connected as remote client", () => {
    render(
      <MemoryRouter>
        <SharedControlProvider send={vi.fn()}>
          <Header />
        </SharedControlProvider>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("button", { name: /shared control settings/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /abandon game|exit game/i }),
    ).not.toBeInTheDocument();

    // DNF and theme toggle should still be available
    expect(
      screen.getByRole("button", { name: /mark players as 'did not finish'/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /switch to/i }),
    ).toBeInTheDocument();
  });

  it("does not render shared control button when playing in offline mode", () => {
    useGame.setState({
      offline: true,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("button", { name: /shared control settings/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /abandon game|exit game/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark players as 'did not finish'/i }),
    ).toBeInTheDocument();
  });
});
