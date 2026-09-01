import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useGamesPlayed from "../../../stores/gamesPlayed";
import BottomGamesCount from "./BottomGamesCount";

vi.mock("../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

describe("BottomGamesCount", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useGamesPlayed.setState({
      started: 5,
      completed: 3,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the current game count", () => {
    render(<BottomGamesCount />);
    expect(
      screen.getByText("5 games started and 3 completed on this computer"),
    ).toBeInTheDocument();
  });

  it("does not open dialog if released before long press finishes", () => {
    render(<BottomGamesCount />);
    const textElement = screen.getByText(
      "5 games started and 3 completed on this computer",
    );

    fireEvent.pointerDown(textElement, { button: 0, clientX: 100, clientY: 100 });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.pointerUp(textElement);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Reset counter")).not.toBeInTheDocument();
  });

  it("opens dialog when long pressed and resets counter on confirm", () => {
    render(<BottomGamesCount />);
    const textElement = screen.getByText(
      "5 games started and 3 completed on this computer",
    );

    fireEvent.pointerDown(textElement, { button: 0, clientX: 100, clientY: 100 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText("Reset counter")).toBeInTheDocument();
    expect(
      screen.getByText("Do you want to reset the counter?"),
    ).toBeInTheDocument();

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

    fireEvent.pointerDown(textElement, { button: 0, clientX: 100, clientY: 100 });

    act(() => {
      vi.advanceTimersByTime(1750);
    });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(useGamesPlayed.getState().started).toBe(5);
    expect(useGamesPlayed.getState().completed).toBe(3);
  });
});
