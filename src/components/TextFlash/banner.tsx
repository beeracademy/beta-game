import { Box } from "@mui/material";
import type { FunctionComponent, ReactNode } from "react";
import { IoFlame } from "react-icons/io5";

type TextFlashVariant = "hype" | "king" | "jester" | "kill";

interface TextFlashBannerProps {
  text: string;
  variant: TextFlashVariant;
  durationMs: number;
}

interface VariantStyleConfig {
  textColor: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  icon: ReactNode;
}

const VARIANT_CONFIGS: Record<TextFlashVariant, VariantStyleConfig> = {
  king: {
    textColor: "#ffd768",
    borderColor: "rgba(245, 197, 66, 0.55)",
    glowColor: "rgba(245, 197, 66, 0.35)",
    bgGradient:
      "linear-gradient(135deg, rgba(42, 34, 18, 0.94) 0%, rgba(20, 20, 24, 0.94) 100%)",
    icon: (
      <Box
        component="img"
        src="/crown.svg"
        alt="King"
        sx={{
          width: { xs: 28, sm: 34 },
          height: { xs: 28, sm: 34 },
          flexShrink: 0,
          filter: "drop-shadow(0 2px 8px rgba(245, 197, 66, 0.6))",
        }}
      />
    ),
  },
  jester: {
    textColor: "#ff79b0",
    borderColor: "rgba(240, 98, 146, 0.55)",
    glowColor: "rgba(240, 98, 146, 0.35)",
    bgGradient:
      "linear-gradient(135deg, rgba(46, 18, 36, 0.94) 0%, rgba(20, 20, 24, 0.94) 100%)",
    icon: (
      <Box
        component="img"
        src="/jester.svg"
        alt="Jester"
        sx={{
          width: { xs: 28, sm: 34 },
          height: { xs: 28, sm: 34 },
          flexShrink: 0,
          filter: "drop-shadow(0 2px 8px rgba(240, 98, 146, 0.6))",
        }}
      />
    ),
  },
  kill: {
    textColor: "#ff6b6b",
    borderColor: "rgba(255, 82, 82, 0.55)",
    glowColor: "rgba(255, 82, 82, 0.35)",
    bgGradient:
      "linear-gradient(135deg, rgba(46, 18, 20, 0.94) 0%, rgba(20, 20, 24, 0.94) 100%)",
    icon: (
      <Box
        component="img"
        src="/skull.svg"
        alt="Kill"
        sx={{
          width: { xs: 26, sm: 32 },
          height: { xs: 26, sm: 32 },
          flexShrink: 0,
          filter: "drop-shadow(0 2px 8px rgba(255, 82, 82, 0.6))",
        }}
      />
    ),
  },
  hype: {
    textColor: "#ffbe3b",
    borderColor: "rgba(255, 165, 2, 0.55)",
    glowColor: "rgba(255, 165, 2, 0.35)",
    bgGradient:
      "linear-gradient(135deg, rgba(46, 32, 16, 0.94) 0%, rgba(20, 20, 24, 0.94) 100%)",
    icon: (
      <IoFlame
        size={30}
        color="#ffa502"
        style={{
          flexShrink: 0,
          filter: "drop-shadow(0 2px 8px rgba(255, 165, 2, 0.7))",
        }}
      />
    ),
  },
};

const TextFlashBanner: FunctionComponent<TextFlashBannerProps> = ({
  text,
  variant,
  durationMs,
}) => {
  const config = VARIANT_CONFIGS[variant] ?? VARIANT_CONFIGS.hype;

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: "12%", sm: "18%" },
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: (theme) => theme.zIndex.modal + 1,
        pointerEvents: "none",
        textAlign: "center",
        maxWidth: "92vw",
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.25, sm: 1.75 },
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 1, sm: 1.25 },
          borderRadius: 50,
          background: config.bgGradient,
          border: "1.5px solid",
          borderColor: config.borderColor,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.75), 0 0 24px ${config.glowColor}`,
          backdropFilter: "blur(16px)",
          // forwards keeps the faded-out (opacity 0) end state instead of snapping back to visible
          animation: `textFlashBadge ${durationMs}ms cubic-bezier(0.2, 0.9, 0.3, 1) forwards`,
          "@keyframes textFlashBadge": {
            "0%": {
              transform: "translateY(-20px) scale(0.88)",
              opacity: 0,
            },
            "14%": {
              transform: "translateY(2px) scale(1.03)",
              opacity: 1,
            },
            "22%": {
              transform: "translateY(0px) scale(1)",
              opacity: 1,
            },
            "82%": {
              transform: "translateY(0px) scale(1)",
              opacity: 1,
            },
            "100%": {
              transform: "translateY(-14px) scale(0.92)",
              opacity: 0,
            },
          },
        }}
      >
        {config.icon}
        <Box
          component="span"
          sx={{
            fontFamily: "AUPassata, Noto Sans Symbols 2",
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "clamp(1.05rem, 2.2vw, 1.45rem)",
            color: config.textColor,
            textShadow: `0 0 16px ${config.glowColor}, 0 2px 4px rgba(0, 0, 0, 0.8)`,
            letterSpacing: 1,
            lineHeight: 1.2,
            whiteSpace: "normal",
            textAlign: "center",
          }}
        >
          {text}
        </Box>
      </Box>
    </Box>
  );
};

export { TextFlashBanner };
export type { TextFlashVariant };
