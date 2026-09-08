import { useCallback, useEffect, useRef, useState } from "react";

interface WebSocketApi {
  connect: (url: string) => void;
  send: (data: any) => void;
  receive: (callback: (data: any) => void) => void;
  close: () => void;
  ready: boolean;
  error: boolean;
}

const useWebSocket = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const receiveRef = useRef<((data: any) => void) | null>(null);
  const pendingRef = useRef<string[]>([]);
  const urlRef = useRef<string | null>(null);

  const flushPending = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const queued = pendingRef.current;
    pendingRef.current = [];
    for (const message of queued) {
      try {
        socket.send(message);
      } catch {
        // Socket died between the readyState check and the send — drop it.
      }
    }
  }, []);

  // Detach handlers before closing so a stale socket can never flip the state
  // of the socket that replaced it.
  const teardown = useCallback((socket: WebSocket | null) => {
    if (!socket) return;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;

    if (socket.readyState === WebSocket.CONNECTING) {
      // Closing a socket mid-handshake makes the browser log
      // "WebSocket is closed before the connection is established".
      // Wait for the handshake to finish, then close cleanly.
      socket.onopen = () => socket.close();
      return;
    }

    socket.onopen = null;
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }, []);

  const connect = useCallback(
    (url: string) => {
      const previous = socketRef.current;

      // Already connected (or mid-handshake) to this exact URL — nothing to do.
      // Keeps StrictMode double-effects and reconnect timers from tearing down
      // a perfectly healthy socket.
      if (
        previous &&
        urlRef.current === url &&
        (previous.readyState === WebSocket.CONNECTING ||
          previous.readyState === WebSocket.OPEN)
      ) {
        return;
      }

      socketRef.current = null;
      teardown(previous);

      pendingRef.current = [];
      setReady(false);
      setError(false);

      const socket = new WebSocket(url);
      socketRef.current = socket;
      urlRef.current = url;

      socket.onopen = () => {
        if (socketRef.current !== socket) return;
        setReady(true);
        flushPending();
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) return;
        pendingRef.current = [];
        setReady(false);
      };

      socket.onerror = () => {
        if (socketRef.current !== socket) return;
        setError(true);
      };

      socket.onmessage = (event) => {
        if (socketRef.current !== socket) return;
        receiveRef.current?.(JSON.parse(event.data));
      };
    },
    [flushPending, teardown],
  );

  const send = useCallback((data: any) => {
    const socket = socketRef.current;
    if (!socket) return;

    const message = JSON.stringify(data);

    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(message);
      } catch {
        // Ignore sends that race with an unexpected close.
      }
      return;
    }

    // Still handshaking: buffer and flush once the socket opens.
    if (socket.readyState === WebSocket.CONNECTING) {
      pendingRef.current.push(message);
    }
  }, []);

  const receive = useCallback((callback: (data: any) => void) => {
    receiveRef.current = callback;
  }, []);

  const close = useCallback(() => {
    const socket = socketRef.current;
    socketRef.current = null;
    urlRef.current = null;
    pendingRef.current = [];
    teardown(socket);
    setReady(false);
  }, [teardown]);

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      socketRef.current = null;
      urlRef.current = null;
      pendingRef.current = [];
      teardown(socket);
    };
  }, [teardown]);

  // The returned object must keep a stable identity for the lifetime of the
  // hook. It is a common dependency of the effects that own the connection, and
  // if it were re-created whenever `ready`/`error` changed those effects would
  // tear the socket down and reconnect on every state flip — an endless
  // connect/close loop. Consumers that need to react to the connection state
  // depend on `ws.ready` instead.
  const [api] = useState<WebSocketApi>(() => ({
    connect,
    send,
    receive,
    close,
    ready,
    error,
  }));

  api.connect = connect;
  api.send = send;
  api.receive = receive;
  api.close = close;
  api.ready = ready;
  api.error = error;

  return api;
};

export default useWebSocket;
