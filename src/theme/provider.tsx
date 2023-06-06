import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import useSettings from "../stores/settings";
import { light } from "./light";
import { dark } from "./dark";

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
