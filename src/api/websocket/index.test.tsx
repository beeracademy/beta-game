import { act, renderHook } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useWebSocket from ".";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];

  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new DOMException(
        "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.",
        "InvalidStateError",
      );
    }
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  emit(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

describe("useWebSocket", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("queues sends made while the socket is still connecting and flushes them on open", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));

    const socket = MockWebSocket.instances[0];
    expect(() =>
      act(() => result.current.send({ event: "GET_GAME_STATE" })),
    ).not.toThrow();
    expect(socket.sent).toHaveLength(0);

    act(() => socket.open());

    expect(socket.sent).toEqual([JSON.stringify({ event: "GET_GAME_STATE" })]);
    expect(result.current.ready).toBe(true);
  });

  it("does not reconnect when connect is called again with the same url", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));
    act(() => MockWebSocket.instances[0].open());
    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(result.current.ready).toBe(true);
  });

  it("ignores close events from sockets that have already been replaced", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));
    const first = MockWebSocket.instances[0];
    act(() => first.open());

    act(() => result.current.connect("ws://localhost/ws/remote/other/"));
    const second = MockWebSocket.instances[1];
    act(() => second.open());

    expect(result.current.ready).toBe(true);

    // Late close from the abandoned socket must not flip `ready` to false.
    act(() => first.close());

    expect(result.current.ready).toBe(true);
  });

  it("keeps delivering messages after reconnecting without re-registering receive", () => {
    const { result } = renderHook(() => useWebSocket());
    const received: unknown[] = [];

    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));
    act(() => result.current.receive((data) => received.push(data)));
    act(() => MockWebSocket.instances[0].open());
    act(() => MockWebSocket.instances[0].emit({ event: "GAME_STATE" }));

    act(() => result.current.close());
    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));
    act(() => MockWebSocket.instances[1].open());
    act(() => MockWebSocket.instances[1].emit({ event: "DNF_STATE" }));

    expect(received).toEqual([{ event: "GAME_STATE" }, { event: "DNF_STATE" }]);
  });

  it("keeps a stable identity so connection-owning effects do not re-run", () => {
    const connectEffectRuns = vi.fn();

    const { result } = renderHook(() => {
      const ws = useWebSocket();
      useEffect(() => {
        connectEffectRuns();
        ws.connect("ws://localhost/ws/remote/abc/");
        return () => ws.close();
      }, [ws]);
      return ws;
    });

    act(() => MockWebSocket.instances[0].open());
    act(() => MockWebSocket.instances[0].close());

    // A changing `ws` identity used to retrigger the effect on every ready/error
    // flip, closing and reopening the socket in an endless loop.
    expect(connectEffectRuns).toHaveBeenCalledTimes(1);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(result.current.ready).toBe(false);
  });

  it("drops sends once the socket is closed", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => result.current.connect("ws://localhost/ws/remote/abc/"));
    const socket = MockWebSocket.instances[0];
    act(() => socket.open());
    act(() => result.current.close());

    expect(() =>
      act(() => result.current.send({ event: "GET_GAME_STATE" })),
    ).not.toThrow();
    expect(socket.sent).toHaveLength(0);
  });
});
