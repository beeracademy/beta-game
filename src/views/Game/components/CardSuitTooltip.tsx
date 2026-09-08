import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import {
  type Card,
  type CardSuit,
  type CardValue,
  getCardASCIISymbol,
  getCardImageURI,
  getCardSuitColor,
  getCardSuitName,
  valueToName,
} from "../../../models/card";
import type { Player } from "../../../models/player";
import PlayerCross from "./PlayerCross";

interface CardSuitTooltipProps {
  cardValue: number;
  symbol: string;
  cardsLeft: number;
  suits: CardSuit[];
  draws: Card[];
  players: Player[];
}

const CardSuitTooltip: FunctionComponent<CardSuitTooltipProps> = ({
  cardValue,
  symbol,
  cardsLeft,
  suits,
  draws,
  players,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={12}
      data-testid={`card-suit-tooltip-${cardValue}`}
      sx={{
        minWidth: 210,
        maxWidth: 250,
        p: 1.5,
        borderRadius: 2,
        backdropFilter: "blur(12px)",
        backgroundColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(24, 24, 28, 0.96)"
            : "rgba(255, 255, 255, 0.98)",
        border: "1px solid",
        borderColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.14)"
            : "rgba(0, 0, 0, 0.12)",
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 12px 32px -4px rgba(0, 0, 0, 0.85)"
            : "0 12px 32px -4px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.25,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "0.02em",
          }}
        >
          {valueToName(cardValue)} ({symbol})
        </Typography>

        <Box
          sx={{
            px: 0.9,
            py: 0.25,
            borderRadius: "999px",
            fontSize: "0.7rem",
            fontWeight: 700,
            backgroundColor:
              cardsLeft > 0 ? "primary.main" : "action.disabledBackground",
            color: cardsLeft > 0 ? "primary.contrastText" : "text.disabled",
          }}
        >
          {cardsLeft > 0 ? `${cardsLeft} / ${suits.length} left` : "All drawn"}
        </Box>
      </Box>

      {/* Vertical list of suit cards */}
      <Stack spacing={1}>
        {suits.map((suit) => {
          const card: Card = {
            value: cardValue as CardValue,
            suit,
          };

          const drawIndex = draws.findIndex(
            (c) => c.value === cardValue && c.suit === suit,
          );
          const isDrawn = drawIndex !== -1;
          const drawnByPlayer =
            isDrawn && players.length > 0
              ? players[drawIndex % players.length]?.username
              : undefined;
          const drawnRound =
            isDrawn && players.length > 0
              ? Math.floor(drawIndex / players.length) + 1
              : undefined;

          const suitName = getCardSuitName(card);
          const suitColor = getCardSuitColor(card, theme.palette.mode);

          return (
            <Box
              key={suit}
              data-testid={`suit-row-${suit}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: 0.5,
                borderRadius: 1.5,
                transition: "background-color 0.15s ease",
                backgroundColor: isDrawn
                  ? "transparent"
                  : (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.04)"
                        : "rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Card Face thumbnail */}
              <Box
                sx={{
                  position: "relative",
                  width: 42,
                  height: 59,
                  borderRadius: "5px",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#111",
                  border: "1px solid",
                  borderColor: isDrawn
                    ? (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.1)"
                    : (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.22)"
                          : "rgba(0, 0, 0, 0.18)",
                  boxShadow: isDrawn ? "none" : "0 2px 6px rgba(0, 0, 0, 0.25)",
                }}
              >
                <Box
                  component="img"
                  src={getCardImageURI(card)}
                  alt={`${suitName} ${symbol}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    ...(isDrawn && {
                      filter: "grayscale(100%) contrast(0.8)",
                      opacity: 0.35,
                    }),
                  }}
                />

                {/* DNF-style cartoony cross overlay when drawn */}
                {isDrawn && (
                  <PlayerCross
                    data-testid={`crossout-${suit}`}
                    width="100%"
                    height="100%"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none",
                      zIndex: 2,
                      filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.6))",
                      opacity: 0.5,
                    }}
                  />
                )}
              </Box>

              {/* Suit info and status */}
              <Stack sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    lineHeight: 1.2,
                    color: isDrawn ? "text.secondary" : suitColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <span style={{ fontSize: "0.95rem" }}>
                    {getCardASCIISymbol(card)}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {suitName}
                  </span>
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.72rem",
                    lineHeight: 1.2,
                    mt: 0.35,
                    ...(isDrawn
                      ? {
                          color: "text.secondary",
                          opacity: 0.85,
                        }
                      : {
                          color:
                            theme.palette.mode === "dark"
                              ? "#6ee7b7"
                              : "#059669",
                          fontWeight: 600,
                        }),
                  }}
                >
                  {isDrawn
                    ? drawnByPlayer
                      ? `Drawn by ${drawnByPlayer}${
                          drawnRound ? ` (R${drawnRound})` : ""
                        }`
                      : "Drawn"
                    : "In deck"}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default CardSuitTooltip;
export { CardSuitTooltip, valueToName };
