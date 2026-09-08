import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useChat from "../../stores/chat";
import useGame from "../../stores/game";
import useSettings from "../../stores/settings";
import { SharedControlProvider } from "../../stores/sharedControl";
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

describe("GameView game chat connection", () => {
  let connectMock: ReturnType<typeof vi.fn<(gameId: number) => void>>;
  let disconnectMock: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWsCallbacks = {
      sendMock: vi.fn(),
      connectMock: vi.fn(),
      ready: true,
    };
    connectMock = vi.fn<(gameId: number) => void>();
    disconnectMock = vi.fn<() => void>();
    useChat.setState({
      gameId: undefined,
      Connect: connectMock,
      Disconnect: disconnectMock,
    });
    useSettings.setState({ remoteControl: false, remoteToken: undefined });
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

  const renderHost = () =>
    render(
      <MemoryRouter>
        <GameView />
      </MemoryRouter>,
    );

  const renderRemote = () =>
    render(
      <MemoryRouter>
        <SharedControlProvider send={vi.fn()}>
          <GameView />
        </SharedControlProvider>
      </MemoryRouter>,
    );

  it("connects to the game chat as the host of an online game", () => {
    renderHost();

    expect(connectMock).toHaveBeenCalledWith(21447);
  });

  it("does not connect to the game chat when opened as a remote", () => {
    renderRemote();

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("does not connect to the game chat for an offline game", () => {
    useGame.setState({ offline: true });

    renderHost();

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
