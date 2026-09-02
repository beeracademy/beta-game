import { Box, useTheme } from "@mui/material";
import { FunctionComponent, useCallback } from "react";
import ApexChart from "react-apexcharts";
import type { ApexAxisChartSeries } from "apexcharts";
import useGame from "../../../stores/game";
import { useGameMetrics, usePlayerMetrics } from "../../../stores/metrics";
import { useShallow } from "zustand/react/shallow";

const Chart: FunctionComponent = () => {
  const theme = useTheme();

  const game = useGame(
    useShallow((state) => ({
      players: state.players,
      numberOfRounds: state.numberOfRounds,
      sipsInABeer: state.sipsInABeer,
    })),
  );

  const playerMetrics = usePlayerMetrics();
  const gameMetrics = useGameMetrics();
  const activePlayerIndex = !gameMetrics.done
    ? gameMetrics.activePlayerIndex
    : -1;

  const datasets = useCallback(() => {
    const data: ApexAxisChartSeries = playerMetrics.map((pm, i) => {
      return {
        data: pm.cumulativeSips,
        name: game.players[i]?.username,
        color: (theme.player as any)[i],
      };
    });

    // Pad data with null so all series have the same length
    // otherwise ApexCharts will draw the chart incorrectly
    const maxLength = Math.max(...data.map((d) => d.data.length));
    data.forEach((d) => {
      d.data.push(...Array(maxLength - d.data.length).fill(null));
    });

    return data;
  }, [playerMetrics, theme.palette.mode]);

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        minWidth: 0,
      }}
    >
      <ApexChart
        options={{
          chart: {
            animations: {
              enabled: false,
            },
            zoom: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
            selection: {
              enabled: false,
            },
            redrawOnParentResize: true,
            redrawOnWindowResize: true,
            fontFamily: "AUPassata",
            background: "transparent",
          },
          stroke: {
            curve: "straight",
            width: game.players.map((_, i) =>
              activePlayerIndex >= 0 && i === activePlayerIndex ? 5 : 2,
            ),
          },
          grid: {
            borderColor: theme.palette.divider,
          },
          markers: {
            size: game.players.map((_, i) =>
              activePlayerIndex >= 0 && i === activePlayerIndex ? 6 : 3,
            ),
            strokeColors: Object.values(theme.player),
            hover: {
              size: 8,
            },
            showNullDataPoints: false,
          },
          yaxis: {
            title: {
              text: "Sips",
            },
            min: 0,
            opposite: true,
            forceNiceScale: true,
            labels: {
              style: {
                colors: theme.palette.text.primary,
              },
            },
          },
          xaxis: {
            title: {
              text: "Round",
            },
            min: 1,
            max: game.numberOfRounds + 1,
            labels: {
              style: {
                colors: theme.palette.text.primary,
              },
              formatter: (val: string) => {
                return `${parseInt(val) - 1}`;
              },
            },
            axisBorder: {
              show: false,
            },
          },
          legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            labels: {
              colors: theme.palette.text.primary,
            },
          },
          theme: {
            mode: theme.palette.mode,
          },
        }}
        series={datasets()}
        type="line"
        width="100%"
        height="100%"
      />
    </Box>
  );
};

export default Chart;
