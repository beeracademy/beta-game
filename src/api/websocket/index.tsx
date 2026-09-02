import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = socket;
    if (!socket) {
      return;
    }

    socket.onopen = () => {
      setReady(true);
    };

    socket.onclose = () => {
      setReady(false);
    };

    socket.onerror = () => {
      setError(true);
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  const connect = useCallback((url: string) => {
    const s = new WebSocket(url);
    socketRef.current = s;
    setSocket(s);
  }, []);

  const send = useCallback((data: any) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  const receive = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.onmessage = (event) => {
        callback(JSON.parse(event.data));
      };
    }
  }, []);

  const close = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  return useMemo(
    () => ({ connect, send, receive, close, ready, error }),
    [connect, send, receive, close, ready, error],
  );
};

export default useWebSocket;
