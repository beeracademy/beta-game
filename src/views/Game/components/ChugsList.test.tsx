import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ChugsList from "./ChugsList";
import useGame, { createInitialGameState } from "../../../stores/game";

describe("ChugsList component", () => {
  beforeEach(() => {
    useGame.setState({
      ...createInitialGameState(),
      players: [
        { id: 1, username: "Alice" },
        { id: 2, username: "Bob" },
      ],
      draws: [
        {
          suit: "H",
          value: 14,
          start_delta_ms: 1000,
          chug_start_start_delta_ms: 1200,
          chug_end_start_delta_ms: 5400,
        },
      ],
    });
  });

  it("renders list of chugs with player name and formatted duration", () => {
    render(<ChugsList />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("00:04.200")).toBeInTheDocument();
  });
});
