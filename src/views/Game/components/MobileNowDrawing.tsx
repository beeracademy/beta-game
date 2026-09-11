import { Typography } from "@mui/material";
import type { FunctionComponent } from "react";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";

// Small "who's up" indicator shown above the mobile standings list.
const MobileNowDrawing: FunctionComponent = () => {
	const players = useGame((state) => state.players);
	const gameMetrics = useGameMetrics();

	const player = players[gameMetrics.activePlayerIndex];

	if (!player || gameMetrics.done) {
		return null;
	}

	return (
		<Typography
			sx={{
				fontSize: 16,
				color: "text.secondary",
				paddingX: 0.5,
				textAlign: "center",
				flexShrink: 0,
			}}
		>
			waiting for <strong>{player.username}</strong>
		</Typography>
	);
};

export default MobileNowDrawing;
