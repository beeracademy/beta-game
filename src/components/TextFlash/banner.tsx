import { Box } from "@mui/material";
import { type CSSProperties, type FunctionComponent, useState } from "react";

type TextFlashVariant = "hype" | "king" | "jester" | "kill";

interface TextFlashBannerProps {
	text: string;
	variant: TextFlashVariant;
	durationMs: number;
}

const VARIANT_COLORS: Record<TextFlashVariant, string> = {
	hype: "#f5a623",
	king: "#daaf57",
	jester: "#9f2d4b",
	kill: "#f5de88",
};

const TextFlashBanner: FunctionComponent<TextFlashBannerProps> = ({
	text,
	variant,
	durationMs,
}) => {
	// Randomized once per message (component remounts via `key` on each new flash)
	const [spinDir] = useState(() => (Math.random() < 0.5 ? -1 : 1));

	return (
		<Box
			sx={{
				position: "fixed",
				top: "15%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: (theme) => theme.zIndex.modal + 1,
				pointerEvents: "none",
				textAlign: "center",
				maxWidth: "90vw",
				px: 2,
			}}
		>
			<Box
				component="span"
				style={{ "--spin-dir": spinDir } as CSSProperties}
				sx={{
					display: "inline-block",
					fontFamily: "AUPassata, Noto Sans Symbols 2",
					fontWeight: "bold",
					textTransform: "uppercase",
					fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
					color: VARIANT_COLORS[variant],
					textShadow: "0 0 12px rgba(0, 0, 0, 0.8), 0 4px 0 rgba(0, 0, 0, 0.4)",
					letterSpacing: 1,
					// forwards keeps the faded-out (opacity 0) end state instead of snapping back to visible
					animation: `textFlashPop ${durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
					"@keyframes textFlashPop": {
						"0%": {
							transform: "scale(0.4) rotate(calc(var(--spin-dir) * -6deg))",
							opacity: 0,
						},
						"12%": {
							transform: "scale(1.15) rotate(calc(var(--spin-dir) * 2deg))",
							opacity: 1,
						},
						"20%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
						"80%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
						"100%": { transform: "scale(0.85) rotate(0deg)", opacity: 0 },
					},
				}}
			>
				{text}
			</Box>
		</Box>
	);
};

export { TextFlashBanner };
export type { TextFlashVariant };
