import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FunctionComponent, useState } from "react";

interface NumberOfPlayersSelectorProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
}

const NumberOfPlayersSelector: FunctionComponent<NumberOfPlayersSelectorProps> = (props) => {
    const [value, setValue] = useState<number>(props.value);

    return (
        <ToggleButtonGroup exclusive fullWidth size="small">
            {Array.from({ length: props.max - props.min + 1 }, (_, i) => i + props.min).map((i) => (
                <ToggleButton
                    key={i}
                    value={i}
                    selected={value === i}
                    onClick={() => {
                        props.onChange(i);
                        setValue(i);
                    }}
                >
                    {i}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default NumberOfPlayersSelector;
