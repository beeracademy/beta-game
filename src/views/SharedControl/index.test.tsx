import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../stores/game";
import SharedControlView from "./index";

let mockWsCallbacks: {
  receiveCb?: (data: any) => void;
  sendMock: ReturnType<typeof vi.fn>;
  ready: boolean;
};

vi.mock("../../api/websocket", () => ({
  default: () => ({
    ready: mockWsCallbacks.ready,
    error: false,
    connect: vi.fn(),
    close: vi.fn(),
    send: mockWsCallbacks.sendMock,
    receive: (cb: (data: any) => void) => {
      mockWsCallbacks.receiveCb = cb;
    },
  }),
}));

vi.mock("react-use", () => ({
  useSearchParam: () => "test-token",
}));

vi.mock("../Game", () => ({
  default: () => <div data-testid="game-view">Mock GameView</div>,
}));

describe("SharedControlView DNF sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWsCallbacks = {
      sendMock: vi.fn(),
      ready: true,
    };
    useGame.setState({
      players: [
        { id: 101, username: "Alice", token: "tok1" },
        { id: 102, username: "Bob", token: "tok2" },
      ],
      dnf_player_indexes: [],
    });
  });

  it("requests DNF state alongside GAME_STATE when connected", () => {
    render(<SharedControlView />);

    expect(mockWsCallbacks.sendMock).toHaveBeenCalledWith({
      event: "GET_GAME_STATE",
    });
    expect(mockWsCallbacks.sendMock).toHaveBeenCalledWith({
      event: "GET_DNF_STATE",
    });
  });

  it("updates game store dnf_player_indexes when receiving DNF_STATE with object payload", () => {
    render(<SharedControlView />);

    act(() => {
      mockWsCallbacks.receiveCb?.({
        event: "DNF_STATE",
        payload: {
          dnf_player_indexes: [1],
          dnf_player_ids: [102],
        },
      });
    });

    expect(useGame.getState().dnf_player_indexes).toEqual([1]);
  });

  it("updates game store dnf_player_indexes when receiving DNF_STATE with array payload", () => {
    render(<SharedControlView />);

    act(() => {
      mockWsCallbacks.receiveCb?.({
        event: "DNF_STATE",
        payload: [0, 1],
      });
    });

    expect(useGame.getState().dnf_player_indexes).toEqual([0, 1]);
  });

  it("maps dnf_player_ids to indexes when payload only contains dnf_player_ids", () => {
    render(<SharedControlView />);

    act(() => {
      mockWsCallbacks.receiveCb?.({
        event: "DNF_STATE",
        payload: {
          dnf_player_ids: [102],
        },
      });
    });

    expect(useGame.getState().dnf_player_indexes).toEqual([1]);
  });
});
