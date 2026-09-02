import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../stores/game";
import { SharedControlProvider } from "../../stores/sharedControl";
import GameView from "./index";

const flashCardMock = vi.fn();
const hideCardMock = vi.fn();
const flashTextMock = vi.fn();

vi.mock("../../components/CardFlash", () => ({
  useCardFlash: () => ({
    flash: flashCardMock,
    hide: hideCardMock,
    show: false,
  }),
}));

vi.mock("../../components/TextFlash", () => ({
  useTextFlash: () => ({
    flash: flashTextMock,
    clear: vi.fn(),
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

vi.mock("../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
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
vi.mock("./components/GameTable", () => ({
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
vi.mock("../../components/MemeDialog", () => ({
  default: () => <div data-testid="mock-meme-dialog" />,
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
vi.mock("./components/ChugsHistoryDialog", () => ({
  default: () => <div data-testid="mock-chugs-history-dialog" />,
}));

describe("Remote card flash in GameView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      players: [
        { id: 101, username: "Alice", token: "tok1" },
        { id: 102, username: "Bob", token: "tok2" },
      ],
      dnf_player_indexes: [],
      draws: [],
      numberOfRounds: 13,
      offline: true,
      gameStartTimestamp: Date.now(),
      turnStartTimestamp: Date.now(),
    });
  });

  it("does not flash card on initial mount of remote", () => {
    render(
      <MemoryRouter>
        <SharedControlProvider send={vi.fn()}>
          <GameView />
        </SharedControlProvider>
      </MemoryRouter>,
    );

    expect(flashCardMock).not.toHaveBeenCalled();
  });

  it("flashes card on remote when a new card is drawn", () => {
    render(
      <MemoryRouter>
        <SharedControlProvider send={vi.fn()}>
          <GameView />
        </SharedControlProvider>
      </MemoryRouter>,
    );

    const drawnCard = {
      value: 5,
      suit: "H",
      start_delta_ms: 1000,
    };

    act(() => {
      useGame.setState({
        draws: [drawnCard],
      });
    });

    expect(flashCardMock).toHaveBeenCalledWith(drawnCard);
  });

  it("flashes hype text and hides card on remote when an Ace (chug card) is drawn", () => {
    render(
      <MemoryRouter>
        <SharedControlProvider send={vi.fn()}>
          <GameView />
        </SharedControlProvider>
      </MemoryRouter>,
    );

    const aceCard = {
      value: 14,
      suit: "S",
      start_delta_ms: 2000,
    };

    act(() => {
      useGame.setState({
        draws: [aceCard],
      });
    });

    expect(hideCardMock).toHaveBeenCalled();
    expect(flashTextMock).toHaveBeenCalledWith(expect.any(String), {
      variant: "hype",
    });
  });
});
