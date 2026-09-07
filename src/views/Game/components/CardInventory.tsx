import type { SxProps, Theme } from "@mui/material";
import { Box, Card, darken, Stack, Typography, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { type FunctionComponent, memo } from "react";
import { useShallow } from "zustand/react/shallow";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";

// Lifts the card up slightly with a tactile press on active
const liftHoverSx: SxProps<Theme> = {
  transition: "transform 0.15s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    zIndex: 10,
  },
  "&:active": {
    transform: "translateY(1px) scale(0.98)",
  },
};

interface CardInventoryProps {
  onCardClick?: () => void;
}

const CardInventory: FunctionComponent<CardInventoryProps> = ({
  onCardClick,
}) => {
  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      draws: state.draws,
      DrawCard: state.DrawCard,
    })),
  );

  const gameMetrics = useGameMetrics();

  const cardsLeftOfValue = (value: number) => {
    return (
      gameMetrics.numberOfPlayers -
      game.draws.filter((card) => card.value === value).length
    );
  };

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        justifyContent: "center",
      }}
    >
      {new Array(13).fill(0).map((_, i) => {
        const empty = cardsLeftOfValue(i + 2) === 0;

        return (
          <CardInventoryCard
            key={i}
            kind={valueToSymbol(i + 2)}
            value={empty ? 0 : cardsLeftOfValue(i + 2)}
            onClick={onCardClick}
          />
        );
      })}
    </Stack>
  );
};

interface CardInventoryCardProps {
  kind: string;
  value: number;
  onClick?: () => void;
}

const CardInventoryCard: FunctionComponent<CardInventoryCardProps> = (
  props,
) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <AnimatePresence initial={false}>
        <Card
          key="card"
          variant="outlined"
          onClick={props.onClick}
          sx={{
            zIndex: 1,
            width: 78,
            height: 106,
            borderRadius: 2,
            border: "1px solid",
            borderColor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.16)"
                : "rgba(0, 0, 0, 0.12)",
            boxShadow: "none",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textAlign: "center",
            position: "relative",
            userSelect: "none",
            cursor: "pointer",
            ...(props.value > 0 && liftHoverSx),

            ...(props.value <= 0 && {
              opacity: 0.35,
              borderStyle: "dashed",
              background: (t) =>
                t.palette.mode === "dark"
                  ? "url('/whiteheart.svg')"
                  : "url('/blackheart.svg')",
              backgroundSize: "36px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }),
          }}
        >
          {props.value > 0 && (
            <>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  textAlign: "left",
                  paddingLeft: "7px",
                  paddingTop: "5px",
                  lineHeight: 1,
                  zIndex: 989,
                }}
              >
                {props.kind}
              </Typography>

              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  color: [
                    theme.palette.text.primary,
                    theme.palette.primary.light,
                    theme.palette.text.primary,
                  ],
                }}
                key={props.value}
                transition={{
                  duration: 0.45,
                  ease: "easeInOut",
                }}
                style={{
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
                  }}
                >
                  {props.value}
                </Typography>
              </motion.div>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  textAlign: "left",
                  paddingLeft: "7px",
                  paddingTop: "5px",
                  transform: "rotate(180deg)",
                  color: "primary.main",
                  lineHeight: 1,
                }}
              >
                {props.kind}
              </Typography>
            </>
          )}
        </Card>

        <CardStack size={props.value} />
      </AnimatePresence>
    </Box>
  );
};

const CardStack = memo((props: { size: number }) => {
  return (
    <>
      {new Array(Math.max(0, props.size - 1)).fill(0).map((_, i) => (
        <Card
          variant="outlined"
          key={i}
          sx={{
            position: "absolute",
            top: 0,
            width: 78,
            height: 106,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "none",
            flexShrink: 0,
            opacity: 0.75,
            backgroundColor: (t) =>
              darken(t.palette.background.paper, (i / props.size) * 0.15),
            transform: randomRotationBetween(-12, 12),
          }}
        />
      ))}
    </>
  );
});

const randomRotationBetween = (min: number, max: number): string => {
  return `rotate(${Math.floor(Math.random() * (max - min + 1) + min)}deg)`;
};

const valueToSymbol = (value: number) => {
  switch (value) {
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    case 14:
      return "A";
    default:
      return `${value}`;
  }
};

export default CardInventory;
