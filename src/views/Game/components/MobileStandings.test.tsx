import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import MobileStandings from "./MobileStandings";

let mockCardFlashShow = false;
let mockWasRecentlyDismissed = false;

vi.mock("../../../components/CardFlash", () => ({
  useCardFlash: () => ({
    show: mockCardFlashShow,
    wasRecentlyDismissed: () => mockWasRecentlyDismissed,
    flash: vi.fn(),
    hide: vi.fn(),
  }),
}));

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

vi.mock("../../../stores/metrics", () => ({
  useGameMetrics: () => ({
    activePlayerIndex: 0,
    currentRound: 1,
    done: false,
    numberOfPlayers: 2,
    chugging: false,
  }),
  usePlayerMetrics: () => ({
    0: { totalSips: 5, numberOfBeers: 0, numberOfChugs: 0 },
    1: { totalSips: 3, numberOfBeers: 0, numberOfChugs: 0 },
  }),
  usePlayerMetricsByIndex: () => ({
    totalSips: 5,
    maxSips: 5,
    minSips: 1,
    totalTime: 60,
    numberOfBeers: 0,
    numberOfChugs: 0,
  }),
}));

describe("MobileStandings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCardFlashShow = false;
    mockWasRecentlyDismissed = false;
    useGame.setState({
      players: [
        { id: 101, username: "Alice", token: "tok1" },
        { id: 102, username: "Bob", token: "tok2" },
      ],
      dnf_player_indexes: [],
      sipsInABeer: 14,
      draws: [],
    });
  });

  it("opens player stats dialog when clicked under normal conditions", () => {
    render(<MobileStandings />);

    // Initially no dialog
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click first player
    fireEvent.click(screen.getByText("Alice"));

    // Stats dialog opens
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does NOT open player stats dialog when card flash is active", () => {
    mockCardFlashShow = true;
    render(<MobileStandings />);

    fireEvent.click(screen.getByText("Alice"));

    // Stats dialog must not open
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does NOT open player stats dialog when card flash was recently dismissed", () => {
    mockWasRecentlyDismissed = true;
    render(<MobileStandings />);

    fireEvent.click(screen.getByText("Alice"));

    // Stats dialog must not open
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
