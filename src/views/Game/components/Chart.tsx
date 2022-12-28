import { FunctionComponent, useCallback } from "react";
import useGame from "../../../stores/game";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { Box, useTheme } from "@mui/material";
import useSettings from "../../../stores/settings";
import { usePlayerMetrics } from "../../../stores/metrics";

ChartJS.register(LinearScale, PointElement, LineElement, CategoryScale);

interface ChartProps {}

const Chart: FunctionComponent<ChartProps> = () => {
    const theme = useTheme();

    const game = useGame((state) => ({
        players: state.players,
        numberOfRounds: state.numberOfRounds,
    }));

    const playerMetrics = usePlayerMetrics();

    const settings = useSettings((state) => ({
        themeMode: state.themeMode,
    }));

    const datasets = useCallback(() => {
        const data = playerMetrics.map((pm, i) => {
            return {
                label: game.players[i].username,
                data: pm.cumulativeSips,
                fill: false,
                borderColor: (theme.player as any)[i],
                tension: 0.1,
            };
        });

        return data;
    }, [playerMetrics, settings.themeMode]);

    return (
        <Box
            sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: 2,
            }}
        >
            <Line
                data={{
                    labels: Array.from(Array(game.numberOfRounds + 1).keys()),
                    datasets: [...datasets()],
                }}
                options={{
                    animation: false,
                    responsive: true,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: "Sips",
                                color: theme.palette.text.primary,
                            },
                            beginAtZero: true,
                            suggestedMax: 60,
                            grid: {
                                display: true,
                                color: theme.palette.divider,
                            },
                            border: {
                                display: false,
                            },
                            ticks: {
                                color: theme.palette.text.primary,
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Round",
                                color: theme.palette.text.primary,
                            },
                            grid: {
                                display: true,
                                color: theme.palette.divider,
                            },
                            border: {
                                display: false,
                            },
                            ticks: {
                                color: theme.palette.text.primary,
                            },
                        },
                    },
                }}
            />
        </Box>
    );
};

export default Chart;
