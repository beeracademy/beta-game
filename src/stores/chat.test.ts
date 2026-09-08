import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useChat from "./chat";
import useGame from "./game";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send() {}

  close() {
    this.readyState = MockWebSocket.CLOSED;
  }
}

describe("chat store", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    useChat.getState().Disconnect();
    useGame.setState({ offline: false });
  });

  afterEach(() => {
    useChat.getState().Disconnect();
    vi.unstubAllGlobals();
  });

  it("connects to the chat room of an online game", () => {
    useChat.getState().Connect(21447);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toContain("/ws/chat/21447/");
    expect(useChat.getState().gameId).toBe(21447);
  });

  it("never opens a chat socket for an offline game", () => {
    useGame.setState({ offline: true });

    useChat.getState().Connect(21447);

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(useChat.getState().gameId).toBeUndefined();
    expect(useChat.getState().connectionStatus).not.toBe("connecting");
  });

  it("tears down an existing connection if the game turns offline", () => {
    useChat.getState().Connect(21447);
    expect(MockWebSocket.instances).toHaveLength(1);

    useGame.setState({ offline: true });
    useChat.getState().Connect(21448);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(useChat.getState().gameId).toBeUndefined();
  });

  it("ignores connects without a usable game id", () => {
    useChat.getState().Connect(undefined as unknown as number);

    expect(MockWebSocket.instances).toHaveLength(0);
  });
});
