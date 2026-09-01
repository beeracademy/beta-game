import React, { FunctionComponent } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { BsMoonStarsFill, BsSpeakerFill } from "react-icons/bs";
import { FaGamepad, FaPencilRuler } from "react-icons/fa";
import { IoClose, IoDesktopOutline } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import useSettings from "../../stores/settings";

const SettingsDialog: FunctionComponent = () => {
  const settings = useSettings();

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Dialog open={false} maxWidth="md">
      <DialogTitle>Settings</DialogTitle>
      <IconButton sx={{ position: "absolute", top: 8, right: 8 }}>
        <IoClose size={32} />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          width: 700,
          height: 400,
        }}
      >
        <Box
          sx={{
            width: "30%",
            flexShrink: 0,
            p: 2,
          }}
        >
          <Stack spacing={1}>
            <SettingsButton
              onClick={() => setActiveTab(0)}
              active={activeTab === 0}
              icon={<FaPencilRuler />}
              text="Appearance"
            />
            <SettingsButton
              onClick={() => setActiveTab(1)}
              active={activeTab === 1}
              icon={<BsSpeakerFill />}
              text="Sound"
            />
            <SettingsButton
              onClick={() => setActiveTab(2)}
              active={activeTab === 2}
              icon={<FaGamepad />}
              text="Game"
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
          }}
        >
          <Box hidden={activeTab !== 0}>
            <List>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pr: 2,
                }}
              >
                <ListItemText
                  primary="Theme"
                  secondary="Select your preferred theme"
                />
                <ToggleButtonGroup
                  value={settings.themeMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode) {
                      settings.SetThemeMode(newMode);
                    }
                  }}
                  size="small"
                  aria-label="Theme mode"
                >
                  <ToggleButton value="system" aria-label="System theme">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      <IoDesktopOutline size={16} />
                      <span>System</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="light" aria-label="Light theme">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      <MdWbSunny size={16} />
                      <span>Light</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="dark" aria-label="Dark theme">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      <BsMoonStarsFill size={14} />
                      <span>Dark</span>
                    </Stack>
                  </ToggleButton>
                </ToggleButtonGroup>
              </ListItem>
            </List>
          </Box>

          <Box hidden={activeTab !== 1}>
            <List>
              <Stack component={ListItem} alignItems="flex-start">
                <ListItemText primary="Music" />
                <Slider defaultValue={50} />
              </Stack>

              <Stack component={ListItem} alignItems="flex-start">
                <ListItemText primary="Sound FX" />
                <Slider defaultValue={50} />
              </Stack>

              <Stack component={ListItem} alignItems="flex-start">
                <ListItemText primary="Sound pack" />
                <Select fullWidth variant="outlined" value={10}>
                  <MenuItem value={10}>Default</MenuItem>
                  <MenuItem value={20}>Classic</MenuItem>
                  <MenuItem value={30}>Modern</MenuItem>
                </Select>
              </Stack>
            </List>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

interface SettingsButtonProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const SettingsButton: FunctionComponent<SettingsButtonProps> = ({
  icon,
  text,
  active,
  onClick,
}) => {
  return (
    <Button
      variant={active ? "contained" : "text"}
      fullWidth
      sx={{
        textTransform: "none",
        justifyContent: "flex-start",
        padding: "8px 15px",
      }}
      startIcon={icon}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default SettingsDialog;
