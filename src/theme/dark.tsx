import { createTheme, Shadows } from "@mui/material/styles";
const shadows = new Array(25).fill("none") as Shadows;

const dark = createTheme({
  shape: {
    borderRadius: 8,
  },
  shadows: shadows,
  palette: {
    mode: "dark",
    primary: {
      main: "#962e31",
      contrastText: "#eee",
    },
    secondary: {
      main: "#242424",
      contrastText: "#eee",
    },
    text: {
      primary: "#eee",
      secondary: "#a4a4a4",
    },
    info: {
      main: "#3498db",
      contrastText: "#fff",
    },
    warning: {
      main: "#f5de88",
      contrastText: "#fff",
    },
    error: {
      main: "#ea7663",
      contrastText: "#fff",
    },
    success: {
      main: "#84be79",
      contrastText: "#fff",
    },
    background: {
      default: "#242424",
      paper: "#2b2b2b",
    },
  },
  typography: {
    fontFamily: "AUPassata, Noto Sans Symbols 2",
  },
  player: {
    0: "#daaf57",
    1: "#cb6353",
    2: "#5b71ac",
    3: "#6e9dae",
    4: "#88d098",
    5: "#9f2d4b",
  },
});

dark.components = {
  MuiSwitch: {
    styleOverrides: {
      thumb: {
        border: "1px solid",
        borderColor: dark.palette.divider,
      },
    },
  },
  MuiAvatar: {
    defaultProps: {
      variant: "square",
    },
    styleOverrides: {
      root: {
        borderRadius: dark.shape.borderRadius,
      },
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      grouped: {
        "&.Mui-selected": {
          backgroundColor: dark.palette.primary.main,
          color: dark.palette.primary.contrastText,
        },
        "&.Mui-selected:hover": {
          backgroundColor: dark.palette.primary.main,
          color: dark.palette.primary.contrastText,
        },
      },
    },
  },
};

export { dark };
