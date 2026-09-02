import { IconButton, Stack, Tooltip, useTheme } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { BsMoonStarsFill } from "react-icons/bs";
import { IoDesktopOutline } from "react-icons/io5";
import { MdMusicNote, MdMusicOff, MdWbSunny } from "react-icons/md";
import { Howler } from "howler";
import { useSounds } from "../../../hooks/sounds";
import useSettings, {
  getNextThemeMode,
  ThemeMode,
} from "../../../stores/settings";

const LoginHeaderActions: FunctionComponent = () => {
  const theme = useTheme();
  const sound = useSounds();

  const lobbyMusicMuted = useSettings((state) => state.lobbyMusicMuted);
  const SetLobbyMusicMuted = useSettings((state) => state.SetLobbyMusicMuted);
  const themeMode = useSettings((state) => state.themeMode);
  const SetThemeMode = useSettings((state) => state.SetThemeMode);

  useEffect(() => {
    Howler.mute(false);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = !lobbyMusicMuted;
    SetLobbyMusicMuted(nextMuted);
  };

  const handleToggleTheme = () => {
    sound.play("click");
    SetThemeMode(getNextThemeMode(themeMode));
  };

  const themeTitle: Record<ThemeMode, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };
  const nextMode = getNextThemeMode(themeMode);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Tooltip
        title={lobbyMusicMuted ? "Unmute music" : "Mute music"}
        placement="bottom"
      >
        <IconButton
          onClick={handleToggleSound}
          disableRipple
          aria-label={lobbyMusicMuted ? "Unmute music" : "Mute music"}
          sx={{
            width: 38,
            height: 38,
            p: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            color: "text.primary",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(255, 255, 255, 0.08)",
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.25)"
                  : "rgba(255, 255, 255, 0.3)",
            },
            transition: "background-color 0.15s ease, border-color 0.15s ease",
          }}
        >
          {lobbyMusicMuted ? (
            <MdMusicOff size={20} />
          ) : (
            <MdMusicNote size={20} />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip
        title={`Theme: ${themeTitle[themeMode]} (switch to ${themeTitle[nextMode]})`}
        placement="bottom"
      >
        <IconButton
          onClick={handleToggleTheme}
          disableRipple
          aria-label={`Theme: ${themeTitle[themeMode]}. Switch to ${themeTitle[nextMode]} theme.`}
          sx={{
            width: 38,
            height: 38,
            p: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            color:
              themeMode === "dark"
                ? "#f5de88"
                : themeMode === "light"
                  ? "primary.main"
                  : "text.primary",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(255, 255, 255, 0.08)",
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.25)"
                  : "rgba(255, 255, 255, 0.3)",
            },
            transition: "background-color 0.15s ease, border-color 0.15s ease",
          }}
        >
          {themeMode === "system" ? (
            <IoDesktopOutline size={18} />
          ) : themeMode === "dark" ? (
            <BsMoonStarsFill size={18} />
          ) : (
            <MdWbSunny size={20} />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default LoginHeaderActions;
