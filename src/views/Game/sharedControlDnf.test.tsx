import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../stores/game";
import useSettings from "../../stores/settings";
import GameView from "./index";

let mockWsCallbacks: {
  receiveCb?: (data: any) => void;
  sendMock: ReturnType<typeof vi.fn>;
  connectMock: ReturnType<typeof vi.fn>;
  ready: boolean;
};

vi.mock("../../api/websocket", () => ({
  default: () => ({
    ready: mockWsCallbacks.ready,
    error: false,
    connect: mockWsCallbacks.connectMock,
    close: vi.fn(),
    send: mockWsCallbacks.sendMock,
    receive: (cb: (data: any) => void) => {
      mockWsCallbacks.receiveCb = cb;
    },
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

describe("GameView Shared Control DNF sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWsCallbacks = {
      sendMock: vi.fn(),
      connectMock: vi.fn(),
      ready: true,
    };
    useSettings.setState({
      remoteControl: true,
      remoteToken: "host-token-123",
    });
    useGame.setState({
      players: [
        { id: 101, username: "Alice", token: "tok1" },
        { id: 102, username: "Bob", token: "tok2" },
      ],
      dnf_player_indexes: [],
      draws: [],
      numberOfRounds: 1,
      offline: false,
      gameStartTimestamp: Date.now(),
      turnStartTimestamp: Date.now(),
    });
  });

  it("does not connect WebSocket when in offline mode even if remoteControl is enabled", () => {
    useGame.setState({ offline: true });

    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    expect(mockWsCallbacks.connectMock).not.toHaveBeenCalled();
  });

  it("connects WebSocket using base URL when in online mode", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    expect(mockWsCallbacks.connectMock).toHaveBeenCalledTimes(1);
    expect(mockWsCallbacks.connectMock).toHaveBeenCalledWith(
      expect.stringMatching(/^wss?:\/\/.*\/ws\/remote\/host-token-123\/$/),
    );
  });

  it("emits DNF_STATE upon receiving GET_DNF_STATE", () => {
    useGame.setState({ dnf_player_indexes: [0] });

    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    mockWsCallbacks.sendMock.mockClear();

    act(() => {
      mockWsCallbacks.receiveCb?.({ event: "GET_DNF_STATE" });
    });

    expect(mockWsCallbacks.sendMock).toHaveBeenCalledWith({
      event: "DNF_STATE",
      payload: {
        dnf_player_indexes: [0],
        dnf_player_ids: [101],
      },
    });
  });

  it("handles SET_PLAYER_DNF from remote, updates store and emits DNF_STATE to clients", () => {
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    mockWsCallbacks.sendMock.mockClear();

    act(() => {
      mockWsCallbacks.receiveCb?.({
        event: "SET_PLAYER_DNF",
        payload: {
          playerIndex: 1,
          dnf: true,
        },
      });
    });

    expect(useGame.getState().dnf_player_indexes).toEqual([1]);
    expect(mockWsCallbacks.sendMock).toHaveBeenCalledWith({
      event: "DNF_STATE",
      payload: {
        dnf_player_indexes: [1],
        dnf_player_ids: [102],
      },
    });
  });

  it("handles TOGGLE_PLAYER_DNF from remote", () => {
    useGame.setState({ dnf_player_indexes: [1] });

    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

    mockWsCallbacks.sendMock.mockClear();

    act(() => {
      mockWsCallbacks.receiveCb?.({
        event: "TOGGLE_PLAYER_DNF",
        payload: {
          playerIndex: 1,
        },
      });
    });

    expect(useGame.getState().dnf_player_indexes).toEqual([]);
    expect(mockWsCallbacks.sendMock).toHaveBeenCalledWith({
      event: "DNF_STATE",
      payload: {
        dnf_player_indexes: [],
        dnf_player_ids: [],
      },
    });
  });
});
