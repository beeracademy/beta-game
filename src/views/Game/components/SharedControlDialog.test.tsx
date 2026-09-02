import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SharedControlDialog from "./SharedControlDialog";
import useGame, { createInitialGameState } from "../../../stores/game";
import useSettings from "../../../stores/settings";

describe("SharedControlDialog component", () => {
  beforeEach(() => {
    useGame.setState({
      ...createInitialGameState(),
      offline: false,
    });
    useSettings.setState({
      remoteControl: false,
      remoteToken: undefined,
    });
  });

  it("renders Enable button when remoteControl is false", () => {
    render(<SharedControlDialog open={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Shared Control" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Enable shared control/i }),
    ).toBeInTheDocument();
  });

  it("enables shared control on click", () => {
    render(<SharedControlDialog open={true} onClose={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Enable shared control/i }),
    );
    expect(useSettings.getState().remoteControl).toBe(true);
    expect(useSettings.getState().remoteToken).toBeDefined();
  });
});
