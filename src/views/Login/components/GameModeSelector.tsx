import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FunctionComponent, useState } from "react";

type GameMode = "normal" | "time-attack" | "offline";

interface GameModeSelectorProps {
    value: GameMode;
    onChange: (value: GameMode) => void;
}

const GameModeSelector: FunctionComponent<GameModeSelectorProps> = (props) => {
    const [value, setValue] = useState<GameMode>(props.value);

    return (
        <ToggleButtonGroup
            exclusive
            fullWidth
            value={value}
            onChange={(_, value) => {
                props.onChange(value);
                setValue(value);
            }}
            size="small"
        >
            <ToggleButton value="normal">Normal</ToggleButton>
            {/* <ToggleButton value="time-attack">Time Attack</ToggleButton> */}
            <ToggleButton value="offline">Offline</ToggleButton>
        </ToggleButtonGroup>
    );
};

export default GameModeSelector;
export type { GameMode, GameModeSelectorProps };
