import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { FunctionComponent, ReactNode } from "react";
import { IoClose, IoSkullOutline, IoSparkles } from "react-icons/io5";
import { useShallow } from "zustand/react/shallow";
import Base14Sips from "../../../components/Base14Sips";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
import { usePlayerMetricsByIndex } from "../../../stores/metrics";
import { secondsToHHMMSS } from "../../../utilities/time";

interface MobilePlayerStatsDialogProps {
  open: boolean;
  index: number;
  onClose: () => void;
}

// Mobile equivalent of the desktop PlayerItem stats view, plus a DNF toggle
// since the mobile drawer no longer exposes it separately.
const MobilePlayerStatsDialog: FunctionComponent<
  MobilePlayerStatsDialogProps
> = (props) => {
  const theme = useTheme();
  const sound = useSounds();

  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      dnf_player_indexes: state.dnf_player_indexes,
      SetPlayerDNF: state.SetPlayerDNF,
    })),
  );

  const metrics = usePlayerMetricsByIndex(props.index);
  const player = game.players[props.index];
  const isDNF = game.dnf_player_indexes.includes(props.index);

  if (!player) {
    return null;
  }

  const playerColors = theme.player as Record<number, string>;
  const color = playerColors[props.index] ?? playerColors[0];

  const toggleDNF = () => {
    const nextDNF = !isDNF;

    if (nextDNF) {
      sound.play("wilhelm_scream");
    }

    game.SetPlayerDNF(props.index, nextDNF);
  };

  const stats: [string, ReactNode][] = [
    ["Total sips", <Base14Sips value={metrics.totalSips} />],
    ["Max sips", <Base14Sips value={metrics.maxSips} />],
    ["Min sips", <Base14Sips value={metrics.minSips} />],
    ["Total time", secondsToHHMMSS(metrics.totalTime)],
    ["Beers", metrics.numberOfBeers.toString()],
    ["Chugs", metrics.numberOfChugs.toString()],
  ];

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingY: 1.5,
          paddingLeft: 2.5,
          paddingRight: 1.5,
        }}
      >
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 18 }}>
          {player.username}
        </Typography>

        <IconButton
          onClick={props.onClose}
          sx={{ color: "#fff" }}
          aria-label="Close"
        >
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5} sx={{ marginTop: 2 }}>
          {stats.map(([label, value]) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
              }}
            >
              <Typography>{label}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
            </Box>
          ))}
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={isDNF ? <IoSparkles /> : <IoSkullOutline />}
          sx={{ marginTop: 3 }}
          onClick={toggleDNF}
        >
          {isDNF ? "Revive" : "Did not finish"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MobilePlayerStatsDialog;
