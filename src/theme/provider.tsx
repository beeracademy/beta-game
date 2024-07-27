import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import useSettings from "../stores/settings";
import { dark } from "./dark";
import { light } from "./light";

interface ThemeProviderProps {
  children: ReactNode | ReactNode[];
}

const ThemeProvider: FunctionComponent<ThemeProviderProps> = (props) => {
  const themeMode = useSettings((state) => state.themeMode);

  return (
    <MuiThemeProvider theme={themeMode === "light" ? light : dark}>
      {props.children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
