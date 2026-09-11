import { alpha, Box, Card, Stack, useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import { useShallow } from "zustand/react/shallow";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";
import { millisecondsToMMSSsss } from "../../../utilities/time";

export const MobileChugsView: FunctionComponent = () => {
  const theme = useTheme();

  const game = useGame(
    useShallow((state) => ({
      draws: state.draws,
      players: state.players,
    })),
  );

  const chugs = game.draws
    .map((d, i) => ({
      username:
        game.players.length > 0
          ? game.players[i % game.players.length]?.username || ""
          : "",
      duration:
        (d.chug_end_start_delta_ms || 0) - (d.chug_start_start_delta_ms || 0),
      suit: d.suit,
      value: d.value,
      done: !!d.chug_end_start_delta_ms,
    }))
    .filter((d) => d.value === 14 && !!d.done);

  const totalChugSlots = Math.max(game.players.length, chugs.length, 1);
  const remainingSlots = Math.max(totalChugSlots - chugs.length, 0);

  return (
    <Stack
      spacing={1.25}
      sx={{
        width: "100%",
        pb: 1.5,
      }}
    >
      {chugs.map((c, i) => {
        const normalizedCard = {
          ...c,
          suit: (c.suit?.toUpperCase() || c.suit) as any,
        };
        const cardSymbol = getCardASCIISymbol(normalizedCard);
        const rawColor =
          getCardSuitColor(normalizedCard, theme.palette.mode) ||
          (theme.palette.mode === "dark" ? "#a4a4a4" : "#000000");
        const symbolColor = alpha(rawColor, 0.14);

        return (
          <Card
            key={i}
            variant="outlined"
            data-testid={`mobile-chug-item-${i}`}
            sx={{
              height: 68,
              width: "100%",
              flexShrink: 0,
              position: "relative",
              borderRadius: 2,
              border: "1px solid",
              borderColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(0, 0, 0, 0.12)",
              boxShadow: "none",
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                position: "relative",
                zIndex: 1,
                gap: 0.25,
              }}
            >
              <Box
                sx={{
                  width: "90%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {c.username}
              </Box>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {millisecondsToMMSSsss(c.duration)}
              </span>
            </Stack>

            {/* Suit pattern background */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                textAlign: "center",
                color: symbolColor,
                zIndex: 0,
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {new Array(20).fill(0).map((_, idx) => (
                <span key={idx}>{cardSymbol}</span>
              ))}
            </Box>
          </Card>
        );
      })}

      {new Array(remainingSlots).fill(0).map((_, i) => (
        <Card
          key={`pending-${i}`}
          data-testid={`mobile-chug-pending-${i}`}
          variant="outlined"
          sx={{
            height: 68,
            width: "100%",
            flexShrink: 0,
            opacity: 0.45,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            borderRadius: 2,
            borderStyle: "dashed",
            borderWidth: 1.5,
            letterSpacing: "0.04em",
            textTransform: "lowercase",
            fontSize: 14,
            userSelect: "none",
            backgroundColor: "transparent",
          }}
        >
          chug {chugs.length + i + 1}
        </Card>
      ))}
    </Stack>
  );
};

export default MobileChugsView;
