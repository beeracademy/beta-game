import { createTheme, Shadows } from "@mui/material/styles";
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
            main: "#a3d2d2",
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
    },
    player: {
        0: "#f6b93b",
        1: "#e55039",
        2: "#4a69bd",
        3: "#60a3bc",
        4: "#78e08f",
        5: "#b71540",
    },
});

light.components = {
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
};

export { light };
