import { Box, useTheme } from "@mui/material";
import { FunctionComponent, useCallback } from "react";
import ApexChart from "react-apexcharts";
import useGame from "../../../stores/game";
import { usePlayerMetrics } from "../../../stores/metrics";
import useSettings from "../../../stores/settings";

const Chart: FunctionComponent = () => {
  const theme = useTheme();

  const game = useGame((state) => ({
    players: state.players,
    numberOfRounds: state.numberOfRounds,
    sipsInABeer: state.sipsInABeer,
  }));

  const playerMetrics = usePlayerMetrics();

  const settings = useSettings((state) => ({
    themeMode: state.themeMode,
  }));

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
  }, [playerMetrics, settings.themeMode]);

  return (
    <Box
      sx={{
        flex: 1,
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
          grid: {
            borderColor: theme.palette.divider,
          },
          markers: {
            size: 4,
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
            min: 0,
            max: game.numberOfRounds,
            labels: {
              style: {
                colors: theme.palette.text.primary,
              },
            },
            axisBorder: {
              show: false,
            },
          },
          theme: {
            mode: settings.themeMode,
          },
        }}
        series={datasets()}
        type="line"
        height="450px"
        width="100%"
      />
    </Box>
  );
};

export default Chart;
