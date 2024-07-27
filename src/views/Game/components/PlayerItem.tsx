import {
  Box,
  Card,
  Grow,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import Bottle from "../../../components/Bottle";
import Bubbles from "../../../components/Bubbles";
import Conditional from "../../../components/Conditional";
import { Crown, Jester } from "../../../components/Hats";
import { Player } from "../../../models/player";
import useGame from "../../../stores/game";
import {
  useGameMetrics,
  usePlayerMetricsByIndex,
} from "../../../stores/metrics";
import useSettings from "../../../stores/settings";
import { toBase14 } from "../../../utilities/base14";
import { secondsToHHMMSS } from "../../../utilities/time";

interface PlayerItemProps {
  player: Player;
  index: number;
  active?: boolean;
}

const PlayerItem: FunctionComponent<PlayerItemProps> = (props) => {
  const theme = useTheme();

  const sipsInABeer = useGame((state) => state.sipsInABeer);
  const playerMetrics = usePlayerMetricsByIndex(props.index);
  const gameMetrics = useGameMetrics();

  const game = useGame((state) => ({
    dnf_player_indexes: state.dnf_player_indexes,
  }));

  const isFirstRound = gameMetrics.currentRound === 1;

  const isDNF = game.dnf_player_indexes.includes(props.index);

  const settings = useSettings((state) => ({
    simpleCardsMode: state.simpleCardsMode,
    SetSimpleCardsMode: state.SetSimpleCardsMode,
  }));

  const [elapsedTurnTime, setElapsedTurnTime] = useState(0);
  const [intervalRef, setIntervalRef] =
    useState<ReturnType<typeof setInterval>>();

  const updateElapsedTime = () => {
    setElapsedTurnTime(gameMetrics.GetElapsedTurnTime());
  };

  useEffect(() => {
    clearInterval(intervalRef);
    setIntervalRef(undefined);
    setElapsedTurnTime(0);

    if (gameMetrics.activePlayerIndex === props.index) {
      const interval = setInterval(updateElapsedTime, 1);
      setIntervalRef(interval);
    }
  }, [gameMetrics.activePlayerIndex, props.index]);

  const color = useCallback(() => {
    if (props.index < Object.keys(theme.player).length && props.index > 0) {
      return (theme.player as any)[props.index];
    }

    return theme.player[0];
  }, [props.index, theme]);

  const liquidHeightPercentage = useCallback(() => {
    const sipsIntoBeer = playerMetrics.totalSips % sipsInABeer;
    const percentage = (sipsIntoBeer / sipsInABeer) * 100;
    return percentage;
  }, [playerMetrics.totalSips, sipsInABeer]);

  return (
    <Box
      sx={{
        transform: props.active ? "translateY(-32px)" : "none",
        transitionProperty: "transform",
        transitionDuration: "200ms",

        filter: isDNF ? "grayscale(100%)" : "none",
        opacity: isDNF ? 0.75 : 1,
      }}
    >
      <Stack
        direction="row-reverse"
        sx={{
          justifyContent: "right",
          paddingRight: 1,
          paddingLeft: 1,
          height: 30,
        }}
      >
        {new Array(playerMetrics.numberOfBeers).fill(0).map((_, i) => (
          <Grow key={i} in={true} timeout={500}>
            <Box>
              <Bottle color={color()} />
            </Box>
          </Grow>
        ))}
      </Stack>

      <Card
        variant="outlined"
        sx={{
          width: 200,
          height: 220,
          cursor: "pointer",
          position: "relative",
          display: "flex",
          backgroundColor: color(),
          color: "white",
          userSelect: "none",
        }}
        onClick={() => settings.SetSimpleCardsMode(!settings.simpleCardsMode)}
      >
        <Conditional value={isDNF}>
          <Box
            sx={{
              position: "absolute",
              background: "url(/skull.svg)",
              backgroundSize: "40%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
              opacity: 0.5,
              zIndex: 3,
            }}
          />
        </Conditional>

        <Box
          sx={{
            position: "fixed",
            zIndex: 2,
          }}
        >
          {playerMetrics.isLeading && !isFirstRound && (
            <Grow in={true} timeout={500}>
              <Box>
                <Crown
                  style={{
                    marginTop: -43,
                    marginLeft: -33,
                    height: 64,
                    transform: "rotate(-30deg)",
                  }}
                />
              </Box>
            </Grow>
          )}

          {playerMetrics.isLast && !isFirstRound && (
            <Grow in={true} timeout={500}>
              <Box>
                <Jester
                  style={{
                    marginTop: -42,
                    marginLeft: -36,
                    height: 60,
                    transform: "rotate(-30deg)",
                  }}
                />
              </Box>
            </Grow>
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
        >
          <Stack
            sx={{
              padding: 2,
            }}
          >
            <Typography
              fontSize={20}
              fontWeight={900}
              align="center"
              marginBottom={2}
              sx={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {props.player.username}
            </Typography>

            {!settings.simpleCardsMode && (
              <List
                disablePadding
                sx={{
                  "& .MuiTypography-body1": {
                    fontSize: 18,
                    lineHeight: 1,
                  },
                }}
              >
                <ListItem disableGutters disablePadding>
                  <ListItemText
                    sx={{
                      textAlign: "left",
                    }}
                  >
                    Total sips
                  </ListItemText>
                  <ListItemText
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    {toBase14(playerMetrics.totalSips)}
                    <sub>14</sub>
                  </ListItemText>
                </ListItem>

                <ListItem disableGutters disablePadding>
                  <ListItemText
                    sx={{
                      textAlign: "left",
                    }}
                  >
                    Max sips
                  </ListItemText>
                  <ListItemText
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    {toBase14(playerMetrics.maxSips)}
                    <sub>14</sub>
                  </ListItemText>
                </ListItem>
                <ListItem disableGutters disablePadding>
                  <ListItemText
                    sx={{
                      textAlign: "left",
                    }}
                  >
                    Min sips
                  </ListItemText>
                  <ListItemText
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    {toBase14(playerMetrics.minSips)}
                    <sub>14</sub>
                  </ListItemText>
                </ListItem>
                <ListItem disableGutters disablePadding>
                  <ListItemText
                    sx={{
                      textAlign: "left",
                    }}
                  >
                    Total time
                  </ListItemText>
                  <ListItemText
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    {secondsToHHMMSS(playerMetrics.totalTime + elapsedTurnTime)}
                  </ListItemText>
                </ListItem>
              </List>
            )}

            {settings.simpleCardsMode && (
              <Typography fontSize={64} align="center">
                {toBase14(playerMetrics.totalSips)}
                <sub>14</sub>
              </Typography>
            )}
          </Stack>
        </Box>

        <LiquidBox percentage={liquidHeightPercentage()} />
      </Card>
    </Box>
  );
};

interface LiquidBoxProps {
  percentage: number;
}

const LiquidBox: FunctionComponent<LiquidBoxProps> = memo((props) => {
  return (
    <Box
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        width: "100%",
        height: "100%",
        marginTop: `calc(${props.percentage}% + 15px)`,
        transition: "margin-top 300ms",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          "@keyframes wave": {
            "0%": {
              transform: "translate3d(0, 0, 0)",
            },
            "100%": {
              transform: "translate3d(-400px, 0, 0)",
            },
          },

          background: `url(/wave.svg)`,
          backgroundSize: "200px",
          backgroundRepeat: "repeat-x",
          width: "1612px",
          height: "9px",
          marginTop: "-9px",
          animation: "wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;",
          transform: "translate3d(0, 0, 0)",
        }}
      />
      <Bubbles />
    </Box>
  );
});

export default PlayerItem;
