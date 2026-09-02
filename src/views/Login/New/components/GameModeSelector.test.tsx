import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GameModeSelector from "./GameModeSelector";

describe("GameModeSelector component", () => {
  it("renders Online and Offline buttons", () => {
    render(<GameModeSelector value={false} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Online" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Offline" })).toBeInTheDocument();
  });

  it("calls onChange when toggling mode", () => {
    const onChange = vi.fn();
    render(<GameModeSelector value={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Offline" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
