import {
  alpha,
  Badge,
  Box,
  Button,
  Divider,
  Menu,
  Stack,
  Typography,
} from "@mui/material";
import type { FunctionComponent } from "react";
import { BsMoonStarsFill } from "react-icons/bs";
import { FaCommentDots } from "react-icons/fa";
import { GiBeerBottle } from "react-icons/gi";
import { IoLogoGameControllerB } from "react-icons/io";
import {
  IoColorPaletteOutline,
  IoDesktopOutline,
  IoExitOutline,
} from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";
import { useSounds } from "../../../hooks/sounds";
import useChat from "../../../stores/chat";
import type { ThemeMode } from "../../../stores/settings";

interface MobileMoreMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpenChugs: () => void;
  onOpenSharedControl: () => void;
  onOpenChat: () => void;
  onExitGame: () => void;
  isRemote: boolean;
  isGameDone: boolean;
  isOffline?: boolean;
  themeMode: ThemeMode;
  onSetThemeMode: (mode: ThemeMode) => void;
}

export const MobileMoreMenu: FunctionComponent<MobileMoreMenuProps> = ({
  anchorEl,
  onClose,
  onOpenChugs,
  onOpenSharedControl,
  onOpenChat,
  onExitGame,
  isRemote,
  isGameDone,
  isOffline = false,
  themeMode,
  onSetThemeMode,
}) => {
  const sounds = useSounds();
  const chat = useChat(
    useShallow((s) => ({ gameId: s.gameId, unreadCount: s.unreadCount })),
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            minWidth: 260,
          },
        },
        list: {
          sx: { padding: 1 },
        },
      }}
    >
      <Stack divider={<Divider />}>
        {!isRemote && !!chat.gameId && (
          <Button
            fullWidth
            variant="text"
            color="inherit"
            startIcon={
              <Box
                sx={{
                  width: 16,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Badge
                  badgeContent={chat.unreadCount}
                  max={99}
                  color="error"
                  overlap="circular"
                >
                  <FaCommentDots size={18} />
                </Badge>
              </Box>
            }
            onClick={onOpenChat}
            sx={{
              justifyContent: "flex-start",
              borderRadius: 2,
              paddingX: 1.5,
              paddingY: 1.5,
              fontSize: 15,
              fontWeight: 600,
              "& .MuiButton-startIcon": {
                marginLeft: 0,
                marginRight: 1.75,
              },
            }}
          >
            Chat
          </Button>
        )}

        <Button
          fullWidth
          variant="text"
          color="inherit"
          startIcon={
            <Box
              sx={{
                width: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <GiBeerBottle size={18} />
            </Box>
          }
          onClick={onOpenChugs}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            paddingX: 1.5,
            paddingY: 1.5,
            fontSize: 15,
            fontWeight: 600,
            "& .MuiButton-startIcon": {
              marginLeft: 0,
              marginRight: 1.75,
            },
          }}
        >
          Chugs
        </Button>

        {!isRemote && !isOffline && (
          <Button
            fullWidth
            variant="text"
            color="inherit"
            startIcon={
              <Box
                sx={{
                  width: 16,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <IoLogoGameControllerB size={18} />
              </Box>
            }
            onClick={onOpenSharedControl}
            sx={{
              justifyContent: "flex-start",
              borderRadius: 2,
              paddingX: 1.5,
              paddingY: 1.5,
              fontSize: 15,
              fontWeight: 600,
              "& .MuiButton-startIcon": {
                marginLeft: 0,
                marginRight: 1.75,
              },
            }}
          >
            Shared control
          </Button>
        )}

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            paddingX: 1.5,
            paddingY: 1,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.75 }}>
            <Box
              sx={{
                width: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <IoColorPaletteOutline size={16} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
              Theme
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{
              backgroundColor: "action.hover",
              borderRadius: 5,
              padding: 0.5,
              gap: 0.25,
            }}
          >
            {(
              [
                ["light", <MdWbSunny key="light" size={15} />],
                ["system", <IoDesktopOutline key="system" size={15} />],
                ["dark", <BsMoonStarsFill key="dark" size={13} />],
              ] as const
            ).map(([mode, icon]) => (
              <Box
                key={mode}
                component="button"
                type="button"
                aria-label={`${mode} theme`}
                onClick={() => {
                  sounds.play("click");
                  onSetThemeMode(mode);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 26,
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: themeMode === mode ? "text.primary" : "text.disabled",
                  backgroundColor:
                    themeMode === mode ? "background.paper" : "transparent",
                  boxShadow:
                    themeMode === mode
                      ? "0 1px 2px rgba(0, 0, 0, 0.2)"
                      : "none",
                }}
              >
                {icon}
              </Box>
            ))}
          </Stack>
        </Stack>

        {!isRemote && (
          <Button
            fullWidth
            variant="text"
            color="error"
            startIcon={
              <Box
                sx={{
                  width: 16,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <IoExitOutline size={18} />
              </Box>
            }
            onClick={onExitGame}
            sx={{
              justifyContent: "flex-start",
              borderRadius: 2,
              paddingX: 1.5,
              paddingY: 1.5,
              marginTop: 0.5,
              fontSize: 15,
              fontWeight: 600,
              "& .MuiButton-startIcon": {
                marginLeft: 0,
                marginRight: 1.75,
              },
              backgroundColor: (t) => alpha(t.palette.error.main, 0.08),
              "&:hover": {
                backgroundColor: (t) => alpha(t.palette.error.main, 0.16),
              },
            }}
          >
            {isGameDone ? "Exit game" : "Abandon game"}
          </Button>
        )}
      </Stack>
    </Menu>
  );
};
