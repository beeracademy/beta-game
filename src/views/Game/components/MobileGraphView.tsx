import {
  Avatar,
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { FunctionComponent } from "react";
import { useShallow } from "zustand/react/shallow";
import useGame from "../../../stores/game";
import { usePlayerMetrics } from "../../../stores/metrics";
import Chart from "./Chart";

export const MobileGraphView: FunctionComponent = () => {
  const theme = useTheme();

  const players = useGame(useShallow((state) => state.players));
  const playerMetrics = usePlayerMetrics();
  const playerColors = (theme.player ?? {}) as Record<number, string>;

  return (
    <Stack spacing={1.5} sx={{ width: "100%", pb: 1.5 }}>
      <Card
        variant="outlined"
        sx={{
          height: { xs: 300, sm: 340 },
          minHeight: 260,
          borderRadius: 2,
          p: 1,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          touchAction: "pan-y",
          backgroundColor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(36, 36, 36, 0.75)"
              : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(6px)",
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, width: "100%", touchAction: "pan-y" }}>
          <Chart />
        </Box>
      </Card>

      {/* Touch-friendly player legend */}
      <Box sx={{ width: "100%", flexShrink: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}
        >
          Players & Cumulative Sips
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {players.map((player, index) => {
            const color = playerColors[index] ?? playerColors[0];
            const sips = playerMetrics[index]?.totalSips ?? 0;

            return (
              <Chip
                key={index}
                size="small"
                avatar={
                  <Avatar
                    src={player.image}
                    sx={{
                      bgcolor: color,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {player.username[0]}
                  </Avatar>
                }
                label={
                  <Box component="span" sx={{ display: "inline-flex", gap: 0.5 }}>
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>
                      {player.username}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary" }}
                    >
                      ({sips})
                    </Typography>
                  </Box>
                }
                variant="outlined"
                sx={{
                  borderColor: color,
                  backgroundColor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.02)",
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
};

export default MobileGraphView;
