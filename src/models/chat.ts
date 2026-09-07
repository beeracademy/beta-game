interface ChatUser {
  chat_id: string;
  username?: string;
  user_id?: number | null;
  is_game?: boolean;
}

interface ChatMessage {
  event:
    "message" | "connect" | "disconnect" | "chat_id" | "presence" | "history";
  message?: string;
  datetime?: string;
  chat_id?: string;
  username?: string;
  user_id?: number | null;
  is_game?: boolean;
  users?: ChatUser[];
  messages?: ChatMessage[];
}

export type { ChatMessage, ChatUser };
