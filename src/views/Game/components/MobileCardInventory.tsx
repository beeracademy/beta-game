import {
  Box,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { type FunctionComponent, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useShallow } from "zustand/react/shallow";
import {
  type Card as CardModel,
  CardSuits,
  type CardSuit,
  type CardValue,
  getCardASCIISymbol,
  getCardImageURI,
  getCardSuitName,
  valueToName,
  valueToSymbol,
} from "../../../models/card";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";
import PlayerCross from "./PlayerCross";

interface MobileCardInventoryProps {
  onCardClick?: () => void;
}

export const MobileCardInventory: FunctionComponent<MobileCardInventoryProps> = () => {
  const [selectedCardValue, setSelectedCardValue] = useState<number | null>(null);

  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      draws: state.draws,
    })),
  );

  const gameMetrics = useGameMetrics();

  const cardsLeftOfValue = (value: number) => {
    return (
      gameMetrics.numberOfPlayers -
      game.draws.filter((card) => card.value === value).length
    );
  };

  const suitsInPlay: CardSuit[] =
    gameMetrics.numberOfPlayers > 0
      ? (CardSuits.slice(
          0,
          Math.min(gameMetrics.numberOfPlayers, CardSuits.length),
        ) as CardSuit[])
      : (CardSuits.slice(0, 4) as CardSuit[]);

  const selectedCardLeft =
    selectedCardValue !== null ? cardsLeftOfValue(selectedCardValue) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          width: "100%",
        }}
      >
        {new Array(13).fill(0).map((_, i) => {
          const cardValue = i + 2;
          const symbol = valueToSymbol(cardValue);
          const remaining = cardsLeftOfValue(cardValue);
          const isEmpty = remaining <= 0;

          return (
            <Card
              key={cardValue}
              variant="outlined"
              onClick={() => setSelectedCardValue(cardValue)}
              data-testid={`mobile-card-${cardValue}`}
              sx={{
                aspectRatio: "1 / 1.28",
                borderRadius: 2,
                border: "1px solid",
                borderColor: (t) =>
                  isEmpty
                    ? t.palette.divider
                    : t.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.18)"
                      : "rgba(0, 0, 0, 0.14)",
                backgroundColor: (t) =>
                  t.palette.mode === "dark"
                    ? "rgba(32, 32, 36, 0.6)"
                    : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 1.25,
                cursor: "pointer",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                "&:focus": {
                  outline: "none",
                },
                "&:focus-visible": {
                  outline: "none",
                },
                position: "relative",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
                "&:active": {
                  transform: "scale(0.96)",
                },
                ...(isEmpty && {
                  opacity: 0.35,
                  borderStyle: "dashed",
                  background: (t) =>
                    t.palette.mode === "dark"
                      ? "url('/whiteheart.svg')"
                      : "url('/blackheart.svg')",
                  backgroundSize: "28px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }),
              }}
            >
              {!isEmpty ? (
                <>
                  {/* Top left white rank number */}
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 900,
                      textAlign: "left",
                      pl: 0.5,
                      pt: 0.25,
                      lineHeight: 1,
                      color: "text.primary",
                    }}
                  >
                    {symbol}
                  </Typography>

                  {/* Middle big remaining count */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 32,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "text.primary",
                      }}
                    >
                      {remaining}
                    </Typography>
                  </Box>

                  {/* Bottom right inverted red rank number */}
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 900,
                      textAlign: "left",
                      pl: 0.5,
                      pt: 0.25,
                      transform: "rotate(180deg)",
                      color: "primary.main",
                      lineHeight: 1,
                    }}
                  >
                    {symbol}
                  </Typography>
                </>
              ) : (
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
                    lineHeight: 1,
                    pl: 0.5,
                    pt: 0.25,
                    color: "text.disabled",
                  }}
                >
                  {symbol}
                </Typography>
              )}
            </Card>
          );
        })}
      </Box>

      {/* Clean Mobile Card Details Dialog */}
      <Dialog
        open={selectedCardValue !== null}
        onClose={() => setSelectedCardValue(null)}
        maxWidth="xs"
        fullWidth
      >
        {selectedCardValue !== null && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.5,
                px: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                  {valueToName(selectedCardValue)} ({valueToSymbol(selectedCardValue)})
                </Typography>
                <Chip
                  label={
                    selectedCardLeft > 0
                      ? `${selectedCardLeft} / ${suitsInPlay.length} left`
                      : "All drawn"
                  }
                  size="small"
                  color={selectedCardLeft > 0 ? "primary" : "default"}
                  sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                />
              </Box>

              <IconButton
                onClick={() => setSelectedCardValue(null)}
                size="small"
                aria-label="Close"
              >
                <IoClose size={20} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
              <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                {suitsInPlay.map((suit) => {
                  const card: CardModel = {
                    value: selectedCardValue as CardValue,
                    suit,
                  };

                  const drawIndex = game.draws.findIndex(
                    (c) => c.value === selectedCardValue && c.suit === suit,
                  );
                  const isDrawn = drawIndex !== -1;
                  const drawnByPlayer =
                    isDrawn && game.players.length > 0
                      ? game.players[drawIndex % game.players.length]?.username
                      : undefined;
                  const drawnRound =
                    isDrawn && game.players.length > 0
                      ? Math.floor(drawIndex / game.players.length) + 1
                      : undefined;

                  const suitName = getCardSuitName(card);
                  const isRed = suit === "H" || suit === "D";

                  return (
                    <Box
                      key={suit}
                      data-testid={`suit-row-${suit}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: (t) =>
                          t.palette.mode === "dark"
                            ? isDrawn
                              ? "rgba(255, 255, 255, 0.02)"
                              : "rgba(255, 255, 255, 0.05)"
                            : isDrawn
                              ? "rgba(0, 0, 0, 0.02)"
                              : "rgba(0, 0, 0, 0.04)",
                        opacity: isDrawn ? 0.65 : 1,
                      }}
                    >
                      {/* Mini card thumbnail with cartoony cross overlay when drawn */}
                      <Box
                        sx={{
                          position: "relative",
                          width: 38,
                          height: 53,
                          borderRadius: "5px",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "#111",
                        }}
                      >
                        <Box
                          component="img"
                          src={getCardImageURI(card)}
                          alt={`${suitName} ${valueToSymbol(selectedCardValue)}`}
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

                        {/* Cartoony cross overlay when drawn */}
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
                              opacity: 0.55,
                            }}
                          />
                        )}
                      </Box>

                      {/* Suit & status details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: (t) => {
                              if (isRed) {
                                return t.palette.mode === "dark"
                                  ? "#ff7875"
                                  : "#cf1322";
                              }
                              return t.palette.mode === "dark"
                                ? "#d9d9d9"
                                : "#262626";
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box component="span" sx={{ fontSize: 17 }}>
                            {getCardASCIISymbol(card)}
                          </Box>
                          <span>{suitName}</span>
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ fontSize: 13, mt: 0.25 }}
                        >
                          {isDrawn ? (
                            <Box
                              component="span"
                              sx={{ color: "text.secondary" }}
                            >
                              Drawn by{" "}
                              <strong>{drawnByPlayer ?? "Player"}</strong> (R
                              {drawnRound})
                            </Box>
                          ) : (
                            <Box
                              component="span"
                              sx={{
                                color: "success.main",
                                fontWeight: 600,
                              }}
                            >
                              ● In deck
                            </Box>
                          )}
                        </Typography>
                      </Box>

                      {/* Status chip */}
                      <Chip
                        label={isDrawn ? "Drawn" : "Available"}
                        size="small"
                        color={isDrawn ? "default" : "success"}
                        variant="outlined"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 600,
                          opacity: isDrawn ? 0.7 : 1,
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MobileCardInventory;
