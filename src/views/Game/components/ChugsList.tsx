import { alpha, Box, Card, Stack, useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import { useShallow } from "zustand/react/shallow";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";
import { millisecondsToMMSSsss } from "../../../utilities/time";

const ChugsList: FunctionComponent = () => {
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

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: { xs: "flex-start", sm: "center" },
        height: { xs: 65, sm: 75 },
        userSelect: "none",
        flexShrink: 0,
        overflowX: "auto",
      }}
    >
      {chugs.map((c, i) => {
        const cardSymbol = getCardASCIISymbol(c);
        const symbolColor = alpha(getCardSuitColor(c, theme.palette.mode), 0.12);

        return (
          <Card
            sx={{
              height: "100%",
              width: { xs: 160, sm: 200 },
              flexShrink: 0,
              position: "relative",
              borderRadius: 2,
              border: "1px solid",
              borderColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(0, 0, 0, 0.12)",
              boxShadow: "none",
            }}
            variant="outlined"
            key={i}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                position: "relative",
                zIndex: 1,
                fontSize: 18,
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "90%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                }}
              >
                <b>{c.username}</b>
              </Box>
              <span>{millisecondsToMMSSsss(c.duration)}</span>
            </Stack>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                textAlign: "center",
                color: symbolColor,
                zIndex: 0,
                alignItems: "center",
              }}
            >
              {new Array(18).fill(0).map((_, i) => (
                <span key={i}>{cardSymbol}</span>
              ))}
            </Box>
          </Card>
        );
      })}

      {new Array(game.players.length - chugs.length).fill(0).map((_, i) => (
        <Card
          sx={{
            height: "100%",
            width: { xs: 160, sm: 200 },
            flexShrink: 0,
            opacity: 0.45,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            borderRadius: 3,
            borderStyle: "dashed",
            borderWidth: 1.5,
            letterSpacing: "0.04em",
            textTransform: "lowercase",
            fontSize: 14,
          }}
          variant="outlined"
          key={i}
        >
          chug {chugs.length + i + 1}
        </Card>
      ))}
    </Stack>
  );
};

export default ChugsList;
