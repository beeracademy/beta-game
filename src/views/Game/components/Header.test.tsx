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

  it("renders round, cards counter and live secondary metrics placeholders initially", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Round 1\/1/i)).toBeInTheDocument();
    expect(screen.getByText(/Card 0\/0/i)).toBeInTheDocument();
    // Initially when no cards are drawn, both secondary texts show "-"
    const placeholders = screen.getAllByText("-");
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
  });

  it("displays calculated average round time and card time rate", () => {
    const now = Date.now();
    const shuffle = Array.from({ length: 2 * 13 - 1 }, () => 0);
    useGame.setState({
      gameStartTimestamp: now - 60000,
      numberOfRounds: 13,
      shuffleIndices: shuffle,
      players: [
        { id: 1, username: "Alice", token: "tok1" },
        { id: 2, username: "Bob", token: "tok2" },
      ],
      draws: [
        { value: 5, suit: "S", start_delta_ms: 10000 },
        { value: 8, suit: "H", start_delta_ms: 25000 },
        { value: 9, suit: "D", start_delta_ms: 45000 },
        { value: 10, suit: "C", start_delta_ms: 55000 },
      ],
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    // 4 cards in 60 seconds = 15 s / card
    expect(screen.getByText(/15 s \/ card/)).toBeInTheDocument();
    // 2 players, 4 cards = 2 rounds in 60 seconds -> 30 s / round
    expect(screen.getByText(/30 s \/ round/)).toBeInTheDocument();
  });
});
