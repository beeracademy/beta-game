import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Chart from "./Chart";
import useGame, { createInitialGameState } from "../../../stores/game";
import { MetricsStore } from "../../../stores/metrics";
import { ThemeProvider, createTheme } from "@mui/material";

const mockApexChart = vi.fn();
vi.mock("react-apexcharts", () => ({
  default: (props: any) => {
    mockApexChart(props);
    return <div data-testid="mock-apex-chart" />;
  },
}));

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  // @ts-expect-error custom theme property
  player: {
    0: "#f2b705",
    1: "#d9534f",
  },
});

describe("Chart component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      ...createInitialGameState(),
      players: [
        { id: 1, username: "Alice" },
        { id: 2, username: "Bob" },
      ],
    });
    MetricsStore.getState().Update();
  });

  it("applies thicker stroke width and larger markers to the active player", () => {
    render(
      <ThemeProvider theme={theme}>
        <Chart />
      </ThemeProvider>,
    );

    expect(mockApexChart).toHaveBeenCalled();
    const lastCallProps = mockApexChart.mock.calls.at(-1)?.[0];

    // Stroke width for player 0 should be 5, while player 1 is 2
    expect(lastCallProps.options.stroke.width).toEqual([5, 2]);

    // Markers size for player 0 should be 6, while player 1 is 3
    expect(lastCallProps.options.markers.size).toEqual([6, 3]);
  });

  it("resets stroke width when game is finished", () => {
    MetricsStore.setState({
      game: {
        ...MetricsStore.getState().game,
        done: true,
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <Chart />
      </ThemeProvider>,
    );

    const lastCallProps = mockApexChart.mock.calls.at(-1)?.[0];
    expect(lastCallProps.options.stroke.width).toEqual([2, 2]);
    expect(lastCallProps.options.markers.size).toEqual([3, 3]);
  });
});
