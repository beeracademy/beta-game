import { Fab } from "@mui/material";
import { FunctionComponent } from "react";
import { BsMoonStarsFill } from "react-icons/bs";
import { IoDesktopOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import useSettings, { getNextThemeMode } from "../../../stores/settings";
import { useShallow } from "zustand/react/shallow";

interface ThemeModeFabProps {
  absolutePosition?: boolean;
}

const ThemeModeFab: FunctionComponent<ThemeModeFabProps> = ({
  absolutePosition = true,
}) => {
  const { themeMode, SetThemeMode } = useSettings(
    useShallow((state) => ({
      themeMode: state.themeMode,
      SetThemeMode: state.SetThemeMode,
    })),
  );

  return (
    <Fab
      color="primary"
      sx={{
        position: absolutePosition ? "absolute" : undefined,
        bottom: absolutePosition ? 16 : undefined,
        right: absolutePosition ? 16 : undefined,
      }}
      onClick={() => {
        SetThemeMode(getNextThemeMode(themeMode));
      }}
    >
      {themeMode === "system" ? (
        <IoDesktopOutline size={24} />
      ) : themeMode === "dark" ? (
        <BsMoonStarsFill size={24} />
      ) : (
        <MdWbSunny size={24} />
      )}
    </Fab>
  );
};

export default ThemeModeFab;

