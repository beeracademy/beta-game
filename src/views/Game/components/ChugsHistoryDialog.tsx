import {
  Avatar,
  Dialog,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { useShallow } from "zustand/react/shallow";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";
import { milisecondsToMMSSsss } from "../../../utilities/time";

interface ChugsHistoryDialogProps extends DialogProps {}

// Mobile-friendly log of every chug taken so far, opened from the bottom menu
// since there's no room to show it inline like the desktop ChugsList.
const ChugsHistoryDialog: FunctionComponent<ChugsHistoryDialogProps> = (
  props,
) => {
  const theme = useTheme();

  const game = useGame(
    useShallow((state) => ({
      draws: state.draws,
      players: state.players,
    })),
  );

  const playerColors = theme.player as Record<number, string>;

  const chugs = game.draws
    .map((d, i) => ({
      index: i % Math.max(game.players.length, 1),
      duration:
        (d.chug_end_start_delta_ms || 0) - (d.chug_start_start_delta_ms || 0),
      suit: d.suit,
      value: d.value,
      done: !!d.chug_end_start_delta_ms,
    }))
    .filter((d) => d.value === 14 && d.done);

  return (
    <Dialog {...props} fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingY: 1.5,
          paddingLeft: 2.5,
          paddingRight: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Chugs</Typography>

        <IconButton
          onClick={(e) => props.onClose?.(e, "backdropClick")}
          aria-label="Close"
        >
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {chugs.length === 0 ? (
          <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
            No chugs yet
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ marginTop: 0.5 }}>
            {chugs.map((c, i) => {
              const player = game.players[c.index];
              const color = playerColors[c.index] ?? playerColors[0];

              return (
                <Stack
                  key={i}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    src={player?.image}
                    sx={{
                      bgcolor: color,
                      width: 36,
                      height: 36,
                      fontSize: 14,
                    }}
                  />

                  <Typography
                    noWrap
                    sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}
                  >
                    {player?.username}
                  </Typography>

                  <Typography
                    sx={{
                      color: getCardSuitColor(c, theme.palette.mode),
                      fontSize: 18,
                      width: 24,
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    {getCardASCIISymbol(c)}
                  </Typography>

                  <Typography
                    sx={{
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 72,
                      textAlign: "right",
                    }}
                  >
                    {milisecondsToMMSSsss(c.duration)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChugsHistoryDialog;
