import {
	Avatar,
	Box,
	ButtonBase,
	LinearProgress,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { type FunctionComponent, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Base14Sips from "../../../components/Base14Sips";
import Bubbles from "../../../components/Bubbles";
import { Crown, Jester } from "../../../components/Hats";
import useGame from "../../../stores/game";
import { useGameMetrics, usePlayerMetrics } from "../../../stores/metrics";
import MobilePlayerStatsDialog from "./MobilePlayerStatsDialog";

// Ranked list with inline progress bars, replacing the desktop table + graph
// combo which doesn't fit small screens.
const MobileStandings: FunctionComponent = () => {
	const theme = useTheme();

	const game = useGame(
		useShallow((state) => ({
			players: state.players,
			dnf_player_indexes: state.dnf_player_indexes,
			sipsInABeer: state.sipsInABeer,
		})),
	);

	const gameMetrics = useGameMetrics();
	const playerMetrics = usePlayerMetrics();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	// Keeps showing the previous player while the dialog's close transition
	// plays out, instead of snapping to a fallback index.
	const [displayedIndex, setDisplayedIndex] = useState(0);

	const playerColors = theme.player as Record<number, string>;

	const isFirstRound = gameMetrics.currentRound === 1;

	return (
		<Stack spacing={1} sx={{ width: "100%" }}>
			{game.players.map((player, index) => {
				const metrics = playerMetrics[index];
				const isDNF = game.dnf_player_indexes.includes(index);
				const isActive =
					gameMetrics.activePlayerIndex === index && !gameMetrics.done;
				const totalSips = metrics?.totalSips || 0;
				const color = playerColors[index] ?? playerColors[0];
				const sipsIntoBeer = totalSips % game.sipsInABeer;
				const sipsLeft = game.sipsInABeer - sipsIntoBeer;

				return (
					<ButtonBase
						key={index}
						onClick={() => {
							setSelectedIndex(index);
							setDisplayedIndex(index);
						}}
						sx={{
							position: "relative",
							overflow: "hidden",
							display: "flex",
							alignItems: "center",
							gap: 2,
							padding: 1.5,
							borderRadius: 2,
							border: (t) => `1px solid ${t.palette.divider}`,
							backgroundColor: isActive ? color : "transparent",
							opacity: isDNF ? 0.5 : 1,
							textAlign: "left",
							justifyContent: "flex-start",
						}}
					>
						{isActive && (
							<>
								{/* Darkens the player color so the bubbles stand out on light colors */}
								<Box
									sx={{
										position: "absolute",
										inset: 0,
										backgroundColor: "rgba(0, 0, 0, 0.45)",
										zIndex: 0,
									}}
								/>
								<Box
									sx={{
										position: "absolute",
										inset: 0,
										opacity: 0.35,
										zIndex: 0,
									}}
								>
									<Bubbles />
								</Box>
							</>
						)}

						<Avatar
							sx={{
								position: "relative",
								zIndex: 1,
								bgcolor: isActive ? "rgba(255, 255, 255, 0.25)" : color,
								width: 40,
								height: 40,
								fontSize: 15,
								fontWeight: 700,
							}}
						>
							{isDNF ? (
								<Box
									component="img"
									src="/skull.svg"
									alt="DNF"
									sx={{ width: "65%" }}
								/>
							) : (
								player.username.slice(0, 2).toUpperCase()
							)}
						</Avatar>

						<Box sx={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
							<Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
								<Typography
									noWrap
									sx={{
										fontWeight: isActive ? 700 : 500,
										fontSize: 15,
										color: isActive ? "#fff" : "text.primary",
									}}
								>
									{player.username}
								</Typography>

								{!isFirstRound && metrics?.isLeading && (
									<Crown style={{ height: 15 }} />
								)}
								{!isFirstRound && metrics?.isLast && (
									<Jester style={{ height: 15 }} />
								)}
							</Stack>

							<Typography
								sx={{ fontSize: 11 }}
								color={
									isActive ? "rgba(255, 255, 255, 0.85)" : "text.secondary"
								}
							>
								{isDNF ? (
									"DNF"
								) : (
									<>
										{sipsLeft} sip{sipsLeft === 1 ? "" : "s"} left in beer{" "}
										{(metrics?.numberOfBeers ?? 0) + 1}
									</>
								)}
							</Typography>

							<LinearProgress
								variant="determinate"
								value={(sipsLeft / game.sipsInABeer) * 100}
								sx={{
									height: 8,
									borderRadius: 4,
									marginTop: 0.75,
									backgroundColor: isActive
										? "rgba(255, 255, 255, 0.25)"
										: "action.selected",
									"& .MuiLinearProgress-bar": {
										backgroundColor: isActive ? "#fff" : color,
										borderRadius: 4,
									},
								}}
							/>
						</Box>

						<Typography
							sx={{
								position: "relative",
								zIndex: 1,
								fontWeight: 700,
								fontSize: 18,
								minWidth: 36,
								textAlign: "right",
								color: isActive ? "#fff" : "text.primary",
							}}
						>
							<Base14Sips value={totalSips} denotationOpacity={0.6} />
						</Typography>
					</ButtonBase>
				);
			})}

			<MobilePlayerStatsDialog
				open={selectedIndex !== null}
				index={displayedIndex}
				onClose={() => setSelectedIndex(null)}
			/>
		</Stack>
	);
};

export default MobileStandings;
