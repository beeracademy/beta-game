import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardInventory from "./CardInventory";
import useGame, { createInitialGameState } from "../../../stores/game";
import { MetricsStore } from "../../../stores/metrics";

describe("CardInventory component", () => {
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

  it("renders 13 card columns from 2 through A", () => {
    render(<CardInventory />);
    expect(screen.getAllByText("A")).toHaveLength(2);
    expect(screen.getAllByText("K")).toHaveLength(2);
    expect(screen.getAllByText("Q")).toHaveLength(2);
    expect(screen.getAllByText("J")).toHaveLength(2);
  });

  it("calls onCardClick when clicking a card column", () => {
    const onCardClick = vi.fn();
    render(<CardInventory onCardClick={onCardClick} />);

    const cardTwo = screen.getAllByText("2")[0];
    fireEvent.click(cardTwo);

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it("shows suit tooltip when hovering over a card column", async () => {
    render(<CardInventory />);

    const cardAce = screen.getAllByText("A")[0];
    fireEvent.mouseOver(cardAce);

    expect(
      await screen.findByTestId("card-suit-tooltip-14"),
    ).toBeInTheDocument();
    expect(screen.getByText("Aces (A)")).toBeInTheDocument();
  });
});
