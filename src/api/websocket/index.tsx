import { useEffect, useState } from "react";

const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
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

  const connect = (url: string) => {
    const socket = new WebSocket(url);
    setSocket(socket);
  };

  const send = (data: any) => {
    if (socket) {
      socket.send(JSON.stringify(data));
    }
  };

  const receive = (callback: (data: any) => void) => {
    if (socket) {
      socket.onmessage = (event) => {
        callback(JSON.parse(event.data));
      };
    }
  };

  const close = () => {
    if (socket) {
      socket.close();
    }
  };

  return { connect, send, receive, close, ready, error };
};

export default useWebSocket;
