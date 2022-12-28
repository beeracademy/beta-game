import { useEffect, useState } from "react";

const useWebSocket = (url: string) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(url);
        setSocket(socket);

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
    }, [url]);

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

    return { send, receive, ready, error };
};

export default useWebSocket;
