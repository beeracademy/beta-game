import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PreGameScreen from "./PreGameScreen";
import { NewGameProvider } from "../contexts/newGame";
import ThemeProvider from "../../../../theme/provider";

vi.mock("../../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    stop: vi.fn(),
  }),
}));

describe("PreGameScreen component", () => {
  const mockPlayers = [
    { id: 1, username: "Alice" },
    { id: 2, username: "Bob" },
  ];

  it("renders player names and action buttons", () => {
    render(
      <ThemeProvider>
        <NewGameProvider>
          <PreGameScreen players={mockPlayers} onStart={vi.fn()} />
        </NewGameProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Shuffle 'em!/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Keep order/i }),
    ).toBeInTheDocument();
  });

  it("calls onStart with current players when clicking Keep order", () => {
    const onStart = vi.fn();
    render(
      <ThemeProvider>
        <NewGameProvider>
          <PreGameScreen players={mockPlayers} onStart={onStart} />
        </NewGameProvider>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Keep order/i }));
    expect(onStart).toHaveBeenCalledWith(mockPlayers);
  });
});
