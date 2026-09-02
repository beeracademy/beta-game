import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NewGameProvider } from "../contexts/newGame";
import NewGameForm from "./Form";

vi.mock("../../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

describe("NewGameForm", () => {
  it("renders 'Resume a game' button pointing to /login/continue", () => {
    render(
      <MemoryRouter>
        <NewGameProvider>
          <NewGameForm />
        </NewGameProvider>
      </MemoryRouter>,
    );

    const continueLink = screen.getByRole("link", {
      name: "Resume a game",
    });
    expect(continueLink).toBeInTheDocument();
    expect(continueLink).toHaveAttribute("href", "/login/continue");
  });
});
