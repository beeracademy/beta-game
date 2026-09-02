import { createTheme, type Shadows } from "@mui/material/styles";

const shadows = new Array(25).fill("none") as Shadows;

const light = createTheme({
  shape: {
    borderRadius: 8,
  },
  shadows: shadows,
  palette: {
    mode: "light",
    primary: {
      main: "#ac181c",
      contrastText: "#fff",
    },
    secondary: {
      main: "#242424",
    },
    text: {
      primary: "#121826",
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
      default: "#f9fbfd",
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: "AUPassata, Noto Sans Symbols 2",
    fontFamilyMonospace: '"JetBrains Mono", monospace',
  },
  player: {
    0: "#f6b93b",
    1: "#e55039",
    2: "#4a69bd",
    3: "#60a3bc",
    4: "#27ae60",
    5: "#b71540",
  },
});

light.components = {
  MuiButtonBase: {
    defaultProps: {
      // Disable the ripple effect entirely, replaced with a static outline below
      disableRipple: true,
    },
    styleOverrides: {
      root: {
        "&.Mui-focusVisible": {
          outline: `2px solid ${light.palette.primary.main}`,
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
        borderColor: "rgba(0, 0, 0, 0.15)",
        "&:hover": {
          borderColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 28,
        border: `1px solid ${light.palette.divider}`,
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
        borderColor: light.palette.divider,
      },
    },
  },
  MuiAvatar: {
    defaultProps: {
      variant: "square",
    },
    styleOverrides: {
      root: {
        borderRadius: light.shape.borderRadius,
      },
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      grouped: {
        "&.Mui-selected": {
          backgroundColor: light.palette.primary.main,
          color: light.palette.primary.contrastText,
        },
        "&.Mui-selected:hover": {
          backgroundColor: light.palette.primary.main,
          color: light.palette.primary.contrastText,
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

export { light };
