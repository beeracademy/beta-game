import {
  ThemeProvider as MuiThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { FunctionComponent, ReactNode, useMemo } from "react";
import useSettings from "../stores/settings";
import { dark } from "./dark";
import { light } from "./light";
import "./theme";

interface ThemeProviderProps {
  children: ReactNode | ReactNode[];
}

const ThemeProvider: FunctionComponent<ThemeProviderProps> = (props) => {
  const themeMode = useSettings((state) => state.themeMode);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const resolvedTheme = useMemo(() => {
    if (themeMode === "system") {
      return prefersDarkMode ? dark : light;
    }
    return themeMode === "light" ? light : dark;
  }, [themeMode, prefersDarkMode]);

  return (
    <MuiThemeProvider theme={resolvedTheme}>{props.children}</MuiThemeProvider>
  );
};

export default ThemeProvider;
