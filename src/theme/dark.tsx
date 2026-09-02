import { createTheme, type Shadows } from "@mui/material/styles";

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
  MuiButtonBase: {
    defaultProps: {
      // Disable the ripple effect entirely, replaced with a static outline below
      disableRipple: true,
    },
    styleOverrides: {
      root: {
        "&.Mui-focusVisible": {
          outline: `2px solid ${dark.palette.primary.main}`,
          outlineOffset: 2,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 50,
        textTransform: "none",
      },
      outlined: {
        borderColor: "rgba(255, 255, 255, 0.18)",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.35)",
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 28,
        border: `1px solid ${dark.palette.divider}`,
        boxShadow: "none",
        margin: 12,
      },
      paperFullScreen: {
        borderRadius: 0,
        border: "none",
        margin: 0,
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontWeight: 700,
        fontSize: "1.35rem",
        textAlign: "center",
        paddingTop: 28,
        paddingBottom: 4,
        paddingLeft: 24,
        paddingRight: 24,
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 8,
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        flexDirection: "column",
        gap: 8,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24,
        paddingTop: 12,
        "& > :not(:first-of-type)": {
          marginLeft: 0,
        },
      },
    },
  },
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
  MuiInputBase: {
    styleOverrides: {
      root: {
        "& input": {
          "&:-webkit-autofill": {
            // Hack to prevent autofill from changing the text color
            transitionDelay: "9999999999999999s",
          },
        },
      },
    },
  },
};

export { dark };
