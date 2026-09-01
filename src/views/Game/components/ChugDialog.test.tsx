import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import ChugDialog from "./ChugDialog";

const confettiMock = vi.fn();

vi.mock("react-confetti", () => ({
  default: (props: any) => {
    confettiMock(props);
    return (
      <div
        data-testid="confetti-mock"
        data-width={props.width}
        data-height={props.height}
      />
    );
  },
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

describe("ChugDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      players: [{ id: 1, username: "Alice", token: "tok1" }],
      offline: false,
    });
  });

  it("passes window width and height to ReactConfetti and updates on resize", async () => {
    window.innerWidth = 1200;
    window.innerHeight = 800;

    render(<ChugDialog open={true} />);

    const confetti = screen.getByTestId("confetti-mock");
    expect(confetti).toBeInTheDocument();
    expect(confetti).toHaveAttribute("data-width", "1200");
    expect(confetti).toHaveAttribute("data-height", "800");

    act(() => {
      window.innerWidth = 1600;
      window.innerHeight = 900;
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => {
      expect(confetti).toHaveAttribute("data-width", "1600");
      expect(confetti).toHaveAttribute("data-height", "900");
    });
  });
});
