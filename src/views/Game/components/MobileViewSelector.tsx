import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { FunctionComponent } from "react";
import { BsGraphUp, BsPeopleFill } from "react-icons/bs";
import { GiBeerBottle } from "react-icons/gi";
import { TbPlayCard } from "react-icons/tb";

export type MobileViewType = "players" | "cards" | "chugs" | "graph";

interface MobileViewSelectorProps {
  activeView: MobileViewType;
  onChange: (view: MobileViewType) => void;
}

export const MobileViewSelector: FunctionComponent<MobileViewSelectorProps> = ({
  activeView,
  onChange,
}) => {
  return (
    <ToggleButtonGroup
      value={activeView}
      exclusive
      onChange={(_, newView: MobileViewType | null) => {
        if (newView) {
          onChange(newView);
        }
      }}
      fullWidth
      size="small"
      sx={{
        width: "100%",
        flexShrink: 0,
        backgroundColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.04)",
        p: "3px",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        gap: "3px",
        "& .MuiToggleButtonGroup-grouped": {
          border: 0,
          borderRadius: "13px !important",
          textTransform: "none",
          fontWeight: 600,
          fontSize: { xs: 12, sm: 13 },
          py: 0.6,
          px: 0.5,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          boxShadow: "none !important",
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            boxShadow: "none !important",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "primary.main",
            boxShadow: "none !important",
          },
        },
      }}
    >
      <ToggleButton value="players" aria-label="Players view">
        <BsPeopleFill size={15} />
        <span>Players</span>
      </ToggleButton>

      <ToggleButton value="cards" aria-label="Cards view">
        <TbPlayCard size={17} />
        <span>Cards</span>
      </ToggleButton>

      <ToggleButton value="chugs" aria-label="Chugs view">
        <GiBeerBottle size={15} />
        <span>Chugs</span>
      </ToggleButton>

      <ToggleButton value="graph" aria-label="Graph view">
        <BsGraphUp size={15} />
        <span>Graph</span>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default MobileViewSelector;
