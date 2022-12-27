import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FunctionComponent, useState } from "react";

type GameMode = "online" | "offline";

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
            <ToggleButton value="online">Online</ToggleButton>
            <ToggleButton value="offline">Offline</ToggleButton>
        </ToggleButtonGroup>
    );
};

export default GameModeSelector;
export type { GameMode, GameModeSelectorProps };
