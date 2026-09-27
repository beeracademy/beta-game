import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../stores/game";
import GameView from "./index";

const playMock = vi.fn();

vi.mock("../../hooks/sounds", () => ({
  useSounds: () => ({
    play: playMock,
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

vi.mock("../../api/websocket", () => ({
  default: () => ({
    ready: true,
    error: false,
    connect: vi.fn(),
    close: vi.fn(),
    send: vi.fn(),
    receive: vi.fn(),
  }),
}));

vi.mock("./components/Header", () => ({
  default: () => <div data-testid="mock-header" />,
}));
vi.mock("./components/CardInventory", () => ({
  default: () => <div data-testid="mock-card-inventory" />,
}));
vi.mock("./components/ChugsList", () => ({
  default: () => <div data-testid="mock-chugs-list" />,
}));
vi.mock("./components/Table", () => ({
  default: () => <div data-testid="mock-game-table" />,
}));
vi.mock("./components/Chart", () => ({
  default: () => <div data-testid="mock-chart" />,
}));
vi.mock("./components/PlayerList", () => ({
  default: () => <div data-testid="mock-player-list" />,
}));
vi.mock("../../components/Terminal", () => ({
  default: () => <div data-testid="mock-terminal" />,
}));
vi.mock("./components/MobileNowDrawing", () => ({
  default: () => <div data-testid="mock-mobile-now-drawing" />,
}));
vi.mock("./components/MobileStandings", () => ({
  default: () => <div data-testid="mock-mobile-standings" />,
}));
vi.mock("./components/ChugDialog", () => ({
  default: () => <div data-testid="mock-chug-dialog" />,
}));
vi.mock("./components/GameFinishedDialog", () => ({
  default: () => <div data-testid="mock-game-finished-dialog" />,
}));
vi.mock("./components/SharedControlDialog", () => ({
  default: () => <div data-testid="mock-shared-control-dialog" />,
}));

describe("GameView idle sound", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playMock.mockClear();
    useGame.setState({
      id: 21447,
      players: [{ id: 101, username: "Alice", token: "tok1" }],
      shuffleIndices: Array.from({ length: 12 }, (_, i) => i),
      dnf_player_indexes: [],
      draws: [],
      numberOfRounds: 1,
      offline: false,
      gameStartTimestamp: Date.now(),
      turnStartTimestamp: Date.now(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("plays the idle sound after 15 minutes of inactivity", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 15);
    });

    expect(playMock).toHaveBeenCalledWith("tryk_paa_den_lange_tast");
  });

  it("repeats playing the sound every 15 minutes if still no card drawn", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 15);
    });
    expect(playMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 15);
    });
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it("resets the 15-minute countdown when a card is drawn", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    // 10 minutes pass
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 10);
    });
    expect(playMock).not.toHaveBeenCalled();

    // A card is drawn, updating turnStartTimestamp
    act(() => {
      useGame.setState({
        turnStartTimestamp: Date.now(),
        draws: [{ value: 5, suit: "hearts", start_delta_ms: 10000 }],
      });
    });

    // Advance 10 more minutes (total 20 min from game start, but only 10 min since card drawn)
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 10);
    });
    expect(playMock).not.toHaveBeenCalled();

    // 5 more minutes pass (15 min since card drawn) -> sound plays
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 5);
    });
    expect(playMock).toHaveBeenCalledWith("tryk_paa_den_lange_tast");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("does not play when a chug is in progress, starts 15 min countdown once chug ends", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    // Ace drawn -> chug in progress
    act(() => {
      useGame.setState({
        draws: [
          {
            value: 14,
            suit: "spades",
            start_delta_ms: 5000,
            chug_start_start_delta_ms: 5100,
          },
        ],
      });
    });

    // 20 minutes pass during chug -> no sound
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 20);
    });
    expect(playMock).not.toHaveBeenCalled();

    // Chug completes -> turnStartTimestamp set to completion time
    act(() => {
      useGame.setState({
        turnStartTimestamp: Date.now(),
        draws: [
          {
            value: 14,
            suit: "spades",
            start_delta_ms: 5000,
            chug_start_start_delta_ms: 5100,
            chug_end_start_delta_ms: 6000,
          },
        ],
      });
    });

    // 14 minutes pass since chug completed -> still not called
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 14);
    });
    expect(playMock).not.toHaveBeenCalled();

    // Reaching 15 minutes since chug completed -> sound plays
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 1);
    });
    expect(playMock).toHaveBeenCalledWith("tryk_paa_den_lange_tast");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("plays the idle sound if a chug card has been drawn but the chug has not started yet after 15 minutes", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    // Ace drawn, but chug not started yet (no chug_start_start_delta_ms)
    act(() => {
      useGame.setState({
        turnStartTimestamp: Date.now(),
        draws: [
          {
            value: 14,
            suit: "spades",
            start_delta_ms: 5000,
          },
        ],
      });
    });

    // 14 minutes pass -> no sound yet
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 14);
    });
    expect(playMock).not.toHaveBeenCalled();

    // 1 more minute passes (15 minutes total since Ace was drawn) -> sound plays
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 1);
    });
    expect(playMock).toHaveBeenCalledWith("tryk_paa_den_lange_tast");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("does not play when the game is finished", () => {
    // 13 cards for 1 player = finished
    const draws = Array.from({ length: 13 }, (_, i) => ({
      value: (i % 13) + 2,
      suit: "hearts" as const,
      start_delta_ms: i * 1000,
    }));

    act(() => {
      useGame.setState({
        draws,
        gameEndTimestamp: Date.now(),
      });
    });

    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 30);
    });
    expect(playMock).not.toHaveBeenCalled();
  });
});
