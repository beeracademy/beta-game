import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGamesPlayed from "../../../stores/gamesPlayed";
import BottomGamesCount from "./BottomGamesCount";

const playMock = vi.fn();

vi.mock("../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: playMock,
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

describe("BottomGamesCount", () => {
  beforeEach(() => {
    localStorage.clear();
    playMock.mockClear();
    useGamesPlayed.setState({
      started: 5,
      completed: 3,
    });
  });

  it("renders the current game count", () => {
    render(<BottomGamesCount />);
    expect(
      screen.getByText("5 games started and 3 completed on this computer"),
    ).toBeInTheDocument();
  });

  it("opens dialog instantly when pressed and plays pop sound", () => {
    render(<BottomGamesCount />);
    const textElement = screen.getByText(
      "5 games started and 3 completed on this computer",
    );

    fireEvent.click(textElement);

    expect(playMock).toHaveBeenCalledWith("pop");
    expect(screen.getByText("Reset counter")).toBeInTheDocument();
    expect(
      screen.getByText("Do you want to reset the counter?"),
    ).toBeInTheDocument();
  });

  it("resets counter when confirmed in dialog", () => {
    render(<BottomGamesCount />);
    const textElement = screen.getByText(
      "5 games started and 3 completed on this computer",
    );

    fireEvent.click(textElement);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    expect(useGamesPlayed.getState().started).toBe(0);
    expect(useGamesPlayed.getState().completed).toBe(0);
    expect(
      screen.getByText("0 game started and 0 completed on this computer"),
    ).toBeInTheDocument();
  });

  it("does not reset counter if cancelled in dialog", () => {
    render(<BottomGamesCount />);
    const textElement = screen.getByText(
      "5 games started and 3 completed on this computer",
    );

    fireEvent.click(textElement);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(useGamesPlayed.getState().started).toBe(5);
    expect(useGamesPlayed.getState().completed).toBe(3);
  });
});
