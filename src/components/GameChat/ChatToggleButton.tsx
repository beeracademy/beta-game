import { Badge, IconButton, type IconButtonProps, Tooltip } from "@mui/material";
import type { FunctionComponent } from "react";
import { FaCommentDots } from "react-icons/fa";
import { useShallow } from "zustand/react/shallow";
import useChat from "../../stores/chat";

interface ChatToggleButtonProps extends Omit<IconButtonProps, "onClick"> {
  iconSize?: number;
}

const ChatToggleButton: FunctionComponent<ChatToggleButtonProps> = ({
  iconSize = 20,
  sx,
  ...rest
}) => {
  const chat = useChat(
    useShallow((s) => ({
      unreadCount: s.unreadCount,
      connectionStatus: s.connectionStatus,
      gameId: s.gameId,
    })),
  );
  const { Toggle } = useChat.getState();

  if (!chat.gameId) return null;

  return (
    <Tooltip title="Game chat" placement="bottom">
      <IconButton onClick={Toggle} sx={sx} {...rest}>
        <Badge
          badgeContent={chat.unreadCount}
          max={99}
          color="error"
          overlap="circular"
        >
          <FaCommentDots size={iconSize} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ChatToggleButton;
