import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import ChugDialog from "./ChugDialog";

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

const flashMock = vi.fn();

vi.mock("../../../components/TextFlash", () => ({
  useTextFlash: () => ({
    flash: flashMock,
    clear: vi.fn(),
  }),
}));

const getUserStatsMock = vi.fn().mockResolvedValue([]);

vi.mock("../../../api/endpoints/stats", () => ({
  getUserStats: (...args: unknown[]) => getUserStatsMock(...args),
}));

describe("ChugDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      players: [{ id: 1, username: "Alice", token: "tok1" }],
      offline: false,
    });
  });

  it("does not flash 'FINISH HIM!!' on the first chug", () => {
    useGame.setState({
      players: [{ id: 1, username: "Alice", token: "tok1" }],
      draws: [{ value: 14, suit: "S", start_delta_ms: 0 }],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    expect(flashMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/finish him/i),
      expect.anything(),
    );
    expect(flashMock).not.toHaveBeenCalled();
  });

  it("flashes 'DOUBLE KILL!!' on the second chug", () => {
    useGame.setState({
      players: [{ id: 1, username: "Alice", token: "tok1" }],
      draws: [
        {
          value: 14,
          suit: "S",
          start_delta_ms: 0,
          chug_end_start_delta_ms: 1000,
        },
        { value: 14, suit: "C", start_delta_ms: 2000 },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    expect(flashMock).toHaveBeenCalledWith("DOUBLE KILL!!", {
      variant: "kill",
    });
  });

  it("renders a colossal timer dominating the screen", () => {
    render(<ChugDialog open={true} />);
    const timer = screen.getByTestId("chug-timer");
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent("00:00.000");
  });

  it("renders personal best secondary text initially", () => {
    useGame.setState({
      players: [{ id: 99, username: "Alice", token: "tok1" }],
      draws: [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 0,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4970,
        },
        {
          value: 14,
          suit: "S",
          start_delta_ms: 6000,
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    const splitText = screen.getByTestId("chug-split-text");
    expect(splitText).toBeInTheDocument();
    expect(splitText).toHaveTextContent("Personal best 00:03.970");
  });

  it("renders '-x on personal best' with green tint when running and ahead of pace", () => {
    const now = Date.now();
    useGame.setState({
      gameStartTimestamp: now - 5000,
      players: [{ id: 99, username: "Alice", token: "tok1" }],
      draws: [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 0,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4970, // 3970ms
        },
        {
          value: 14,
          suit: "S",
          start_delta_ms: 3000,
          chug_start_start_delta_ms: 4000, // started 1000ms ago (< 3970ms)
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    const splitText = screen.getByTestId("chug-split-text");
    expect(splitText).toBeInTheDocument();
    expect(splitText).toHaveTextContent(/-.*on personal best/);
    expect(splitText).toHaveStyle({ color: "rgba(46, 125, 50, 0.85)" });
  });

  it("renders '+x on personal best' with red tint when running and slower than personal best", () => {
    const now = Date.now();
    useGame.setState({
      gameStartTimestamp: now - 10000,
      players: [{ id: 99, username: "Alice", token: "tok1" }],
      draws: [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 0,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4970, // 3970ms
        },
        {
          value: 14,
          suit: "S",
          start_delta_ms: 4000,
          chug_start_start_delta_ms: 4000, // started 6000ms ago (> 3970ms)
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    const splitText = screen.getByTestId("chug-split-text");
    expect(splitText).toBeInTheDocument();
    expect(splitText).toHaveTextContent(/\+.*on personal best/);
    expect(splitText).toHaveStyle({ color: "rgba(211, 47, 47, 0.85)" });
  });

  it("never renders personal best difference in offline mode even if previous chugs exist", () => {
    useGame.setState({
      offline: true,
      players: [{ id: 0, username: "Alice" }],
      draws: [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 0,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4970,
        },
        {
          value: 14,
          suit: "S",
          start_delta_ms: 6000,
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    expect(screen.queryByTestId("chug-split-text")).not.toBeInTheDocument();
    expect(getUserStatsMock).not.toHaveBeenCalled();
  });

  it("never renders personal best difference in offline mode when running or stopping a chug", () => {
    const now = Date.now();
    useGame.setState({
      offline: true,
      gameStartTimestamp: now - 5000,
      players: [{ id: 0, username: "Alice" }],
      draws: [
        {
          value: 14,
          suit: "S",
          start_delta_ms: 1000,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 3000,
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    expect(screen.queryByTestId("chug-split-text")).not.toBeInTheDocument();
  });

  it("does not compare a just-completed chug against itself in online mode when no previous chug exists", () => {
    useGame.setState({
      offline: false,
      players: [{ id: 99, username: "Alice", token: "tok1" }],
      draws: [
        {
          value: 14,
          suit: "S",
          start_delta_ms: 1000,
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4000,
        },
      ],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
    });

    render(<ChugDialog open={true} />);

    expect(screen.queryByTestId("chug-split-text")).not.toBeInTheDocument();
  });
});
