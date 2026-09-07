import { create } from "zustand";
import type { ChatMessage, ChatUser } from "../models/chat";
import { play } from "../hooks/sounds";

/*
    Connects to the same chat backend the website's game detail page uses
    (chat/consumers.py ChatConsumer). We connect with the "game" query string
    so the backend treats us as an anonymous "Game Display" participant,
    exactly like the physical/TV display would.
*/

interface ChatState {
  gameId?: number;
  isOpen: boolean;
  unreadCount: number;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  myChatId: string | null;
  connectionStatus: "idle" | "connecting" | "connected" | "disconnected";
}

interface ChatActions {
  Connect: (gameId: number) => void;
  Disconnect: () => void;
  Open: () => void;
  Close: () => void;
  Toggle: () => void;
  SendMessage: (text: string) => void;
}

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isDestroyed = false;

const getWsBaseUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    return apiBase.replace(/^http/, "ws").replace(/\/$/, "");
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};

const initialState: ChatState = {
  gameId: undefined,
  isOpen: false,
  unreadCount: 0,
  messages: [],
  onlineUsers: [],
  myChatId: null,
  connectionStatus: "idle",
};

const useChat = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  Connect: (gameId) => {
    if (get().gameId === gameId && socket) {
      // Already connected (or connecting) to this game's chat.
      return;
    }

    get().Disconnect();
    isDestroyed = false;

    set({ ...initialState, gameId, connectionStatus: "connecting" });

    const connect = () => {
      if (isDestroyed) return;

      set({ connectionStatus: "connecting" });

      const url = `${getWsBaseUrl()}/ws/chat/${gameId}/?game`;

      try {
        socket = new WebSocket(url);

        socket.onopen = () => {
          set({ connectionStatus: "connected" });
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as ChatMessage;
            const state = get();

            if (data.event === "chat_id") {
              set({ myChatId: data.chat_id ?? null });
            } else if (data.event === "presence" && data.users) {
              set({ onlineUsers: data.users });
            } else if (data.event === "message") {
              set({ messages: [...state.messages, data] });
              if (!state.isOpen) {
                set((s) => ({ unreadCount: s.unreadCount + 1 }));
                play("pop");
              }
            } else if (data.event === "history" && data.messages) {
              set({ messages: [...data.messages, ...state.messages] });
            } else if (data.event === "connect") {
              const nextOnline = state.onlineUsers.some(
                (u) => u.chat_id === data.chat_id,
              )
                ? state.onlineUsers
                : data.chat_id
                  ? [
                      ...state.onlineUsers,
                      {
                        chat_id: data.chat_id,
                        username: data.username,
                        user_id: data.user_id,
                        is_game: data.is_game,
                      },
                    ]
                  : state.onlineUsers;

              const shouldLog =
                data.username ||
                (data.chat_id && data.chat_id !== state.myChatId);

              set({
                onlineUsers: nextOnline,
                messages: shouldLog
                  ? [...state.messages, data]
                  : state.messages,
              });
            } else if (data.event === "disconnect") {
              const nextOnline = data.chat_id
                ? state.onlineUsers.filter((u) => u.chat_id !== data.chat_id)
                : state.onlineUsers;

              const shouldLog =
                data.username ||
                (data.chat_id && data.chat_id !== state.myChatId);

              set({
                onlineUsers: nextOnline,
                messages: shouldLog
                  ? [...state.messages, data]
                  : state.messages,
              });
            }
          } catch (e) {
            console.error("Error parsing chat message", e);
          }
        };

        socket.onclose = () => {
          set({ connectionStatus: "disconnected" });
          if (!isDestroyed) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        socket.onerror = () => {
          set({ connectionStatus: "disconnected" });
          socket?.close();
        };
      } catch {
        set({ connectionStatus: "disconnected" });
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();
  },

  Disconnect: () => {
    isDestroyed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      socket.close();
      socket = null;
    }
    set({ ...initialState });
  },

  Open: () => set({ isOpen: true, unreadCount: 0 }),
  Close: () => set({ isOpen: false }),
  Toggle: () =>
    set((s) => ({
      isOpen: !s.isOpen,
      unreadCount: s.isOpen ? s.unreadCount : 0,
    })),

  SendMessage: (text) => {
    const message = text.trim();
    if (!message || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ message }));
  },
}));

export default useChat;
