import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardSuitTooltip from "./CardSuitTooltip";

describe("CardSuitTooltip component", () => {
  const players = [
    { id: 1, username: "Alice" },
    { id: 2, username: "Bob" },
  ];

  it("renders header with card rank, symbol, and remaining count", () => {
    render(
      <CardSuitTooltip
        cardValue={14}
        symbol="A"
        cardsLeft={2}
        suits={["S", "C"]}
        draws={[]}
        players={players}
      />,
    );

    expect(screen.getByText("Aces (A)")).toBeInTheDocument();
    expect(screen.getByText("2 / 2 left")).toBeInTheDocument();
  });

  it("shows all suits in deck when no cards of that value have been drawn", () => {
    render(
      <CardSuitTooltip
        cardValue={13}
        symbol="K"
        cardsLeft={2}
        suits={["S", "C"]}
        draws={[]}
        players={players}
      />,
    );

    expect(screen.getByText("Spades")).toBeInTheDocument();
    expect(screen.getByText("Clubs")).toBeInTheDocument();
    const inDeckBadges = screen.getAllByText("In deck");
    expect(inDeckBadges).toHaveLength(2);
    expect(screen.queryByTestId("crossout-S")).not.toBeInTheDocument();
    expect(screen.queryByTestId("crossout-C")).not.toBeInTheDocument();
  });

  it("greys out and crosses out drawn suits with player attribution", () => {
    render(
      <CardSuitTooltip
        cardValue={10}
        symbol="10"
        cardsLeft={1}
        suits={["S", "C"]}
        draws={[
          // Round 1, Player 0 (Alice) draws 10 of Spades
          { value: 10, suit: "S" },
        ]}
        players={players}
      />,
    );

    expect(screen.getByText("1 / 2 left")).toBeInTheDocument();
    expect(screen.getByText("Drawn by Alice (R1)")).toBeInTheDocument();
    expect(screen.getByText("In deck")).toBeInTheDocument();

    // Drawn card has crossout SVG overlay
    expect(screen.getByTestId("crossout-S")).toBeInTheDocument();
    // Undrawn card does not
    expect(screen.queryByTestId("crossout-C")).not.toBeInTheDocument();
  });

  it("displays 'All drawn' when no cards remain of that value", () => {
    render(
      <CardSuitTooltip
        cardValue={2}
        symbol="2"
        cardsLeft={0}
        suits={["S", "C"]}
        draws={[
          { value: 2, suit: "S" },
          { value: 2, suit: "C" },
        ]}
        players={players}
      />,
    );

    expect(screen.getByText("All drawn")).toBeInTheDocument();
    expect(screen.getByTestId("crossout-S")).toBeInTheDocument();
    expect(screen.getByTestId("crossout-C")).toBeInTheDocument();
  });
});
