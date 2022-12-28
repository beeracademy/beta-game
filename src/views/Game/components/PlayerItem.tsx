import { Box, Card, Grow, List, ListItem, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import { FunctionComponent, memo, useCallback } from "react";
import Bottle from "../../../components/Bottle";
import { Player } from "../../../models/player";
import useSettings from "../../../stores/settings";
import { toBase14 } from "../../../utilities/base14";
import { secondsToHHMMSS } from "../../../utilities/time";
import { usePlayerMetricsByIndex } from "../../../stores/metrics";
import Bubbles from "../../../components/Bubbles";
import useGame from "../../../stores/game";
import { Crown, Jester } from "../../../components/Hats";

interface PlayerItemProps {
    player: Player;
    index: number;
    active?: boolean;
}

const PlayerItem: FunctionComponent<PlayerItemProps> = (props) => {
    const theme = useTheme();

    const sipsInABeer = useGame((state) => state.sipsInABeer);

    const metrics = usePlayerMetricsByIndex(props.index);
    
    const settings = useSettings((state) => ({
        simpleCardsMode: state.simpleCardsMode,
        SetSimpleCardsMode: state.SetSimpleCardsMode,
    }));

    const color = useCallback(() => {
        if (props.index < Object.keys(theme.player).length && props.index > 0) {
            return (theme.player as any)[props.index];
        }

        return theme.player[0];
    }, [props.index, theme]);

    const liquidHeightPercentage = useCallback(() => {
        const sipsIntoBeer = metrics.totalSips % sipsInABeer;
        const percentage = (sipsIntoBeer / sipsInABeer) * 100;
        return percentage;
    }, [metrics.totalSips, sipsInABeer]);

    return (
        <Box
            sx={{
                transform: props.active ? "translateY(-32px)" : "none",
                transitionProperty: "transform",
                transitionDuration: "200ms",
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
                {new Array(metrics.numberOfBeers).fill(0).map((_, i) => (
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
                    color: (t) => t.palette.getContrastText(color()),
                }}
                onClick={() => settings.SetSimpleCardsMode(!settings.simpleCardsMode)}
            >
                <Box
                    sx={{
                        position: "fixed",
                        zIndex: 2,
                    }}
                >
                    {metrics.isLeading && (
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

                    {metrics.isLast && (
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
                        <Typography fontSize={20} fontWeight={900} align="center" marginBottom={2}>
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
                                        {toBase14(metrics.totalSips)}
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
                                        {toBase14(metrics.maxSips)}
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
                                        {toBase14(metrics.minSips)}
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
                                        {secondsToHHMMSS(metrics.totalTime)}
                                    </ListItemText>
                                </ListItem>
                            </List>
                        )}

                        {settings.simpleCardsMode && (
                            <Typography fontSize={64} align="center">
                                {toBase14(metrics.totalSips)}
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
                borderTop: "1px solid rgba(255, 255, 255, 0.4)",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                width: "100%",
                height: "100%",
                marginTop: props.percentage + "%",
                transition: "margin-top 300ms",
                zIndex: 1,
            }}
        >
            <Bubbles />
        </Box>
    );
});

export default PlayerItem;
