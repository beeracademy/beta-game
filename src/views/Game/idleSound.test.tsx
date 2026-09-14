import { render } from "@testing-library/react";
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

    vi.advanceTimersByTime(1000 * 60 * 15);

    expect(playMock).toHaveBeenCalledWith("tryk_paa_den_lange_tast");
  });
});
