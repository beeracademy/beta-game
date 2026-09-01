import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import GameFinishedDialog from "./GameFinishedDialog";

vi.mock("@fireworks-js/react", () => ({
  Fireworks: () => <div data-testid="fireworks-mock" />,
}));

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

vi.mock("../../../hooks/camera", () => ({
  useVideoDevices: () => ({
    devices: [],
  }),
}));

describe("GameFinishedDialog", () => {
  const samplePlayers = [
    { id: 1, username: "Alice", token: "tok1" },
    { id: 2, username: "Bob", token: "tok2" },
  ];

  beforeEach(() => {
    localStorage.clear();
    useGame.setState({
      players: samplePlayers,
      offline: false,
      submitted: false,
      description: undefined,
      image: undefined,
      token: "game-token-123",
      id: 999,
    });
  });

  it("in offline mode, still renders picture/notes step first (for local testing)", () => {
    useGame.setState({
      offline: true,
      submitted: false,
    });

    render(<GameFinishedDialog open={true} />);

    // Notes field and Submit button should be visible, same as online mode
    expect(
      screen.getByPlaceholderText(/add game notes or victory message/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();

    // Choices buttons should not yet be visible
    expect(
      screen.queryByRole("button", { name: /play again with the same people/i }),
    ).not.toBeInTheDocument();
  });

  it("when already submitted, bypasses picture/description and directly renders choices", () => {
    useGame.setState({
      submitted: true,
    });

    render(<GameFinishedDialog open={true} />);

    // When already submitted, choices should be directly visible
    expect(
      screen.getByRole("button", { name: /play again with the same people/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /exit game/i }),
    ).toBeInTheDocument();
    // 'Close dialog' button should NOT exist (X is used instead)
    expect(
      screen.queryByRole("button", { name: "Close dialog" }),
    ).not.toBeInTheDocument();

    // Notes / victory message input should NOT be present
    expect(
      screen.queryByPlaceholderText(/add game notes or victory message/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("in online mode, renders picture/notes step first with Submit button", () => {
    useGame.setState({
      offline: false,
      submitted: false,
    });

    render(<GameFinishedDialog open={true} />);

    // Notes field and Submit button should be visible
    expect(
      screen.getByPlaceholderText(/add game notes or victory message/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();

    // Choices buttons should not yet be visible
    expect(
      screen.queryByRole("button", { name: /play again with the same people/i }),
    ).not.toBeInTheDocument();
  });

  it("in online mode, submitting transitions to choices", async () => {
    const submitSpy = vi.fn().mockResolvedValue(undefined);
    useGame.setState({
      offline: false,
      submitted: false,
      Submit: submitSpy,
    });

    render(<GameFinishedDialog open={true} />);

    const submitBtn = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: /play again with the same people/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /exit game/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Close dialog" }),
      ).not.toBeInTheDocument();
    });
  });

  it("triggers PlayAgain on clicking 'Play again with the same people!'", async () => {
    const playAgainSpy = vi.fn().mockResolvedValue(undefined);
    const onCloseSpy = vi.fn();

    useGame.setState({
      offline: true,
      submitted: true,
      PlayAgain: playAgainSpy,
    });

    render(<GameFinishedDialog open={true} onClose={onCloseSpy} />);

    const playAgainBtn = screen.getByRole("button", {
      name: /play again with the same people/i,
    });
    fireEvent.click(playAgainBtn);

    await waitFor(() => {
      expect(playAgainSpy).toHaveBeenCalled();
      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  it("triggers Exit on clicking 'Exit Game'", () => {
    const exitSpy = vi.fn();
    const onCloseSpy = vi.fn();

    useGame.setState({
      offline: true,
      submitted: true,
      Exit: exitSpy,
    });

    render(<GameFinishedDialog open={true} onClose={onCloseSpy} />);

    const exitBtn = screen.getByRole("button", { name: /exit game/i });
    fireEvent.click(exitBtn);

    expect(exitSpy).toHaveBeenCalledWith({ dnf: false, description: undefined });
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("calls onClose when the top-right close icon (X) is clicked", () => {
    const onCloseSpy = vi.fn();

    useGame.setState({
      offline: true,
    });

    render(<GameFinishedDialog open={true} onClose={onCloseSpy} />);

    // Close (X) icon is available regardless of step
    const closeIconBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeIconBtn);

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
