import { Box, Card, Stack, alpha, useTheme } from "@mui/material";
import { FunctionComponent } from "react";
import { getCardASCIISymbol, getCardSuitColor } from "../../../models/card";
import useGame from "../../../stores/game";
import { milisecondsToMMSSsss } from "../../../utilities/time";

const ChugsList: FunctionComponent = () => {
  const theme = useTheme();

  const game = useGame((state) => ({
    draws: state.draws,
    players: state.players,
  }));

  const chugs = game.draws
    .map((d, i) => ({
      username: game.players[i % game.players.length].username,
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
      alignItems="center"
      justifyContent="center"
      spacing={2}
      height={75}
      sx={{
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {chugs.map((c, i) => {
        const cardSymbol = getCardASCIISymbol(c);
        const symbolColor = alpha(getCardSuitColor(c, theme.palette.mode), 0.1);

        return (
          <Card
            sx={{
              height: "100%",
              width: 200,
              position: "relative",
            }}
            variant="outlined"
            key={i}
          >
            <Stack
              direction="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              position="relative"
              zIndex={1}
              fontSize={18}
              gap={1}
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
              <span>{milisecondsToMMSSsss(c.duration)}</span>
            </Stack>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "grid",
                layout: "row",
                gridTemplateColumns: "repeat(6, 1fr)",
                textAlign: "center",
                color: symbolColor,
                zIndex: 0,
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
            width: 200,
            opacity: 0.5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
