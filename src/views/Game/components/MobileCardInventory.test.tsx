import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import useGame, { createInitialGameState } from "../../../stores/game";
import { MetricsStore } from "../../../stores/metrics";
import { MobileCardInventory } from "./MobileCardInventory";

describe("MobileCardInventory component", () => {
  beforeEach(() => {
    useGame.setState({
      ...createInitialGameState(),
      players: [
        { id: 1, username: "Alice" },
        { id: 2, username: "Bob" },
      ],
      draws: [],
    });
    MetricsStore.setState({
      game: {
        ...MetricsStore.getState().game,
        numberOfPlayers: 2,
      },
    });
  });

  it("renders 13 cards from 2 through A with top and bottom rank symbols", () => {
    render(<MobileCardInventory />);
    expect(screen.getByTestId("mobile-card-14")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-card-2")).toBeInTheDocument();
    expect(screen.getAllByText("A")).toHaveLength(2);
    expect(screen.getAllByText("K")).toHaveLength(2);
  });

  it("opens inspection dialog when tapping a card and renders cartoony cross on drawn cards", async () => {
    useGame.setState({
      draws: [{ value: 14, suit: "S" }],
    });

    render(<MobileCardInventory />);

    const cardAce = screen.getByTestId("mobile-card-14");
    fireEvent.click(cardAce);

    expect(await screen.findByText("Aces (A)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    expect(screen.getByTestId("crossout-S")).toBeInTheDocument();
  });

  it("displays correct remaining count when cards are drawn", () => {
    useGame.setState({
      draws: [{ value: 14, suit: "S" }],
    });

    render(<MobileCardInventory />);
    // With 2 players, 1 Ace drawn means 1 Ace remains
    const cardAce = screen.getByTestId("mobile-card-14");
    expect(cardAce).toHaveTextContent("1");
  });
});
