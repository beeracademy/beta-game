import { TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FunctionComponent, useState } from "react";

type TimeAttackMode = "per-person" | "total";

interface TimeAttackSettingsProps {
    onChange?: (value: TimeAttackMode) => void;
}

const TimeAttackSettings: FunctionComponent<TimeAttackSettingsProps> = (props) => {
    const [value, setValue] = useState<TimeAttackMode>("total");

    return (
        <>
            <Typography variant="body2" color="textSecondary">
                In time attack the goal is to complete the game as fast as possible. The target time can be set per player or total. 
                If a player overruns the target time, he is marked as DNF. If the total time is overrun, the game is marked as DNF.
            </Typography>

            <TextField size="small" label="Target time" type="number" />
            <ToggleButtonGroup
                exclusive
                fullWidth
                value={value}
                onChange={(_, value) => {
                    props.onChange?.(value);
                    setValue(value);
                }}
                size="small"
            >
                <ToggleButton value="total">Total</ToggleButton>
                <ToggleButton value="per-person">Per player</ToggleButton>
            </ToggleButtonGroup>
        </>
    );
};

export default TimeAttackSettings;
export type { TimeAttackMode, TimeAttackSettingsProps };
