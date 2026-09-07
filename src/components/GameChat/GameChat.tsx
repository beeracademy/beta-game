import { useTheme } from "@mui/material";
import {
  type FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaCircle,
  FaCommentDots,
  FaGamepad,
  FaPaperPlane,
  FaRegSmile,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { useShallow } from "zustand/react/shallow";
import type { ChatMessage } from "../../models/chat";
import useGame from "../../stores/game";
import useChat from "../../stores/chat";
import EmojiPicker from "./EmojiPicker";
import "./GameChat.scss";

const formatTime = (isoStr?: string): string => {
  if (!isoStr) return "";
  try {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const GameChat: FunctionComponent = () => {
  const theme = useTheme();

  const chat = useChat(
    useShallow((s) => ({
      isOpen: s.isOpen,
      messages: s.messages,
      onlineUsers: s.onlineUsers,
      myChatId: s.myChatId,
      connectionStatus: s.connectionStatus,
      gameId: s.gameId,
    })),
  );
  const { Close, SendMessage } = useChat.getState();

  const players = useGame(useShallow((s) => s.players));

  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOnlinePopover, setShowOnlinePopover] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  useEffect(() => {
    if (chat.isOpen) scrollToBottom();
  }, [chat.isOpen, chat.messages.length]);

  useEffect(() => {
    if (chat.isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
    setShowEmojiPicker(false);
    setShowOnlinePopover(false);
  }, [chat.isOpen]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (chat.isOpen && e.key === "Escape") Close();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [chat.isOpen, Close]);

  const onlineCount = Math.max(
    chat.onlineUsers.length,
    chat.connectionStatus === "connected" ? 1 : 0,
  );

  const getPlayerInfo = (msg: ChatMessage) => {
    const rawName = msg.username?.trim();
    if (!rawName && !msg.user_id) {
      return {
        isPlayer: false,
        index: -1,
        name: msg.chat_id === chat.myChatId ? "You (Guest)" : "Spectator",
        color: "#a1a1aa",
      };
    }

    const index = players.findIndex((p) => {
      if (msg.user_id && p.id === msg.user_id) return true;
      if (rawName && p.username.toLowerCase() === rawName.toLowerCase())
        return true;
      return false;
    });

    if (index !== -1) {
      return {
        isPlayer: true,
        index,
        name: players[index].username,
        color: theme.player[index % 6 as keyof typeof theme.player],
      };
    }

    return {
      isPlayer: false,
      index: -1,
      name: rawName || (msg.chat_id === chat.myChatId ? "You" : "Spectator"),
      color: "#f4f4f5",
    };
  };

  const onlineUsersList = useMemo(() => {
    return chat.onlineUsers.map((u) => {
      const isMe = u.chat_id === chat.myChatId;
      const rawName = u.username?.trim();
      const playerIndex = players.findIndex(
        (p) =>
          (u.user_id && p.id === u.user_id) ||
          (rawName && p.username.toLowerCase() === rawName.toLowerCase()),
      );
      const isPlayer = playerIndex !== -1;
      const color = isPlayer
        ? theme.player[(playerIndex % 6) as keyof typeof theme.player]
        : "#f4f4f5";

      let displayName = "";
      if (isPlayer) {
        displayName = players[playerIndex].username + (isMe ? " (You)" : "");
      } else if (rawName) {
        displayName = rawName + (isMe ? " (You)" : "");
      } else if (u.is_game) {
        displayName = "Game Display";
      } else {
        displayName = isMe ? "You (Guest)" : "Spectator";
      }

      return { ...u, displayName, isPlayer, playerIndex, color, isMe };
    });
  }, [chat.onlineUsers, chat.myChatId, players, theme]);

  const isMine = (msg: ChatMessage): boolean =>
    !!chat.myChatId && msg.chat_id === chat.myChatId;

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    SendMessage(text);
    setInputText("");
    setShowEmojiPicker(false);
    scrollToBottom();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? inputText.length;
      const end = input.selectionEnd ?? inputText.length;
      const next = inputText.slice(0, start) + emoji + inputText.slice(end);
      setInputText(next);
      const nextPos = start + emoji.length;
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(nextPos, nextPos);
      }, 0);
    } else {
      setInputText((t) => t + emoji);
    }
  };

  if (!chat.gameId) return null;

  return (
    <>
      {chat.isOpen && (
        <div
          className="game-chat-backdrop"
          onClick={Close}
          role="button"
          tabIndex={0}
          aria-label="Close chat drawer"
          onKeyDown={(e) => {
            if (e.key === "Escape") Close();
          }}
        />
      )}

      <aside
        className={`game-chat-drawer${chat.isOpen ? " open" : ""}`}
        aria-label="Game Chat"
        aria-hidden={!chat.isOpen}
      >
        <div className="chat-drawer-header">
          <div className="chat-drawer-title-group">
            <div className="chat-header-icon">
              <FaGamepad />
            </div>
            <div>
              <h3 className="chat-drawer-title">Game Chat</h3>
              <div className="chat-drawer-subtitle">
                <span
                  className={`chat-status-indicator ${
                    chat.connectionStatus === "connected"
                      ? "online"
                      : chat.connectionStatus === "connecting"
                        ? "pending"
                        : "offline"
                  }`}
                />
                <span>
                  {chat.connectionStatus === "connected"
                    ? `Live • Game #${chat.gameId}`
                    : chat.connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Offline (reconnecting)"}
                </span>

                {chat.connectionStatus === "connected" && (
                  <>
                    <span className="chat-subtitle-divider">•</span>
                    <div
                      className="chat-online-badge"
                      onMouseEnter={() => setShowOnlinePopover(true)}
                      onMouseLeave={() => setShowOnlinePopover(false)}
                      role="button"
                      tabIndex={0}
                    >
                      <FaUsers />
                      <span>{onlineCount} online</span>

                      {showOnlinePopover && (
                        <div className="chat-online-popover">
                          <div className="chat-online-popover-title">
                            <FaCircle />
                            Online in chat ({onlineCount})
                          </div>
                          <div className="chat-online-popover-users">
                            {onlineUsersList.map((user) => (
                              <div
                                key={user.chat_id}
                                className="chat-online-popover-user"
                              >
                                <span
                                  className="chat-user-bullet"
                                  style={{ background: user.color }}
                                />
                                <span
                                  className="chat-user-name"
                                  style={{ color: user.color }}
                                >
                                  {user.displayName}
                                </span>
                                {user.isPlayer && (
                                  <span
                                    className="chat-player-badge"
                                    style={{
                                      borderColor: user.color,
                                      color: user.color,
                                    }}
                                  >
                                    P{user.playerIndex + 1}
                                  </span>
                                )}
                                {user.is_game && (
                                  <span className="chat-game-badge">HOST</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="chat-drawer-close-btn"
            onClick={Close}
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        <div className="chat-drawer-messages" ref={messagesContainerRef}>
          {chat.messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <FaCommentDots />
              </div>
              <h4>Live Match Chat</h4>
              <p>
                Chat with players and spectators in real time! Send cheer,
                banter, or emojis.
              </p>
            </div>
          ) : (
            chat.messages.map((msg, i) => {
              if (msg.event === "connect") {
                return (
                  <div className="chat-system-message" key={i}>
                    <FaSignInAlt />
                    <span>{msg.username || "Spectator"} joined the chat</span>
                    {msg.datetime && (
                      <span className="chat-system-time">
                        {formatTime(msg.datetime)}
                      </span>
                    )}
                  </div>
                );
              }

              if (msg.event === "disconnect") {
                return (
                  <div className="chat-system-message leave" key={i}>
                    <FaSignOutAlt />
                    <span>{msg.username || "Spectator"} left the chat</span>
                    {msg.datetime && (
                      <span className="chat-system-time">
                        {formatTime(msg.datetime)}
                      </span>
                    )}
                  </div>
                );
              }

              if (msg.event === "message") {
                const mine = isMine(msg);
                const playerInfo = getPlayerInfo(msg);
                return (
                  <div
                    className={`chat-message-row${mine ? " mine" : ""}`}
                    key={i}
                  >
                    <div className={`chat-message-bubble${mine ? " mine" : ""}`}>
                      <div className="chat-message-header">
                        <span
                          className="chat-message-sender"
                          style={{ color: playerInfo.color }}
                        >
                          {playerInfo.name}
                        </span>
                        {playerInfo.isPlayer && (
                          <span
                            className="chat-player-badge"
                            style={{
                              borderColor: playerInfo.color,
                              color: playerInfo.color,
                            }}
                          >
                            P{playerInfo.index + 1}
                          </span>
                        )}
                        {msg.is_game && (
                          <span className="chat-game-badge">HOST</span>
                        )}
                        {msg.datetime && (
                          <span className="chat-message-time">
                            {formatTime(msg.datetime)}
                          </span>
                        )}
                      </div>
                      <div className="chat-message-text">{msg.message}</div>
                    </div>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {showEmojiPicker && (
          <EmojiPicker
            onSelect={insertEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <div className="chat-drawer-footer">
          <div className="chat-input-wrapper">
            <button
              type="button"
              className={`chat-action-btn${showEmojiPicker ? " active" : ""}`}
              onClick={() => setShowEmojiPicker((v) => !v)}
              title="Add Emoji"
              aria-label="Toggle emoji picker"
            >
              <FaRegSmile />
            </button>

            <input
              type="text"
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="chat-text-input"
              maxLength={500}
              disabled={chat.connectionStatus === "disconnected"}
            />

            <button
              type="button"
              className="chat-send-btn"
              disabled={
                !inputText.trim() || chat.connectionStatus !== "connected"
              }
              onClick={sendMessage}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GameChat;
