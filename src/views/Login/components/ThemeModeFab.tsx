import { Fab } from "@mui/material";
import { FunctionComponent } from "react";
import { BsMoonStarsFill } from "react-icons/bs";
import { MdWbSunny } from "react-icons/md";
import useSettings from "../../../stores/settings";

interface ThemeModeFabProps {
    absolutePosition?: boolean;
}

const ThemeModeFab: FunctionComponent<ThemeModeFabProps> = (props) => {
    const {themeMode, SetThemeMode} = useSettings(state => ({
        themeMode: state.themeMode,
        SetThemeMode: state.SetThemeMode,
    }))

    return (
        <Fab
            color="primary"
            sx={{
                position: props.absolutePosition ? "absolute" : undefined,
                bottom: props.absolutePosition ? 16 : undefined,
                right: props.absolutePosition ? 16 : undefined,
            }}
            onClick={() => {
                SetThemeMode(themeMode === "light" ? "dark" : "light");
            }}
        >
            {themeMode === "dark" ? <BsMoonStarsFill size={24} /> : <MdWbSunny size={24} />}
        </Fab>
    );
};

ThemeModeFab.defaultProps = {
    absolutePosition: true,
};

export default ThemeModeFab;
