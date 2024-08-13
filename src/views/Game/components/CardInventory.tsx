import { Box, Card, darken, Stack, Typography, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { FunctionComponent, memo } from "react";
import { useCardFlash } from "../../../components/CardFlash";
import useGame from "../../../stores/game";
import { useGameMetrics } from "../../../stores/metrics";

interface CardInventoryProps {
  onCardClick?: () => void;
}

const CardInventory: FunctionComponent<CardInventoryProps> = ({
  onCardClick,
}) => {
  const game = useGame((state) => ({
    players: state.players,
    draws: state.draws,
    DrawCard: state.DrawCard,
  }));

  const cardFlasher = useCardFlash();

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
      spacing={2}
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
          variant="outlined"
          onClick={props.onClick}
          sx={{
            zIndex: 1,
            width: 78,
            height: 106,
            flexShrink: 0,
            textAlign: "center",
            position: "relative",
            userSelect: "none",
            cursor: "pointer",

            ...(props.value <= 0 && {
              opacity: 0.5,
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
                fontSize={14}
                fontWeight={800}
                textAlign="left"
                paddingLeft="8px"
                paddingTop="8px"
                zIndex={989}
              >
                {props.kind}
              </Typography>

              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  color: [
                    theme.palette.text.primary,
                    theme.palette.primary.light,
                    theme.palette.text.primary,
                  ],
                }}
                key={props.value}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                <Typography fontSize={32}>{props.value}</Typography>
              </motion.div>

              <Typography
                fontSize={14}
                fontWeight={800}
                textAlign="left"
                paddingLeft="8px"
                paddingTop="8px"
                sx={{
                  transform: "rotate(180deg)",
                  color: "primary.main",
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
