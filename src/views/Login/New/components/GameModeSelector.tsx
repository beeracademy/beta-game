import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FunctionComponent, useState } from "react";

interface GameModeSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const GameModeSelector: FunctionComponent<GameModeSelectorProps> = (props) => {
  const [value, setValue] = useState<boolean>(props.value);

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
      <ToggleButton value={false}>Normal</ToggleButton>
      <ToggleButton value={true}>Offline</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default GameModeSelector;
export type { GameModeSelectorProps };
