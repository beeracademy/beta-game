import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NumberOfPlayersSelector from "./NumberOfPlayersSelector";

describe("NumberOfPlayersSelector component", () => {
  it("renders buttons for the given min/max range", () => {
    render(
      <NumberOfPlayersSelector
        min={2}
        max={6}
        value={4}
        onChange={vi.fn()}
      />,
    );

    for (let i = 2; i <= 6; i++) {
      expect(screen.getByRole("button", { name: `${i}` })).toBeInTheDocument();
    }
  });

  it("calls onChange when selecting another count", () => {
    const onChange = vi.fn();
    render(
      <NumberOfPlayersSelector
        min={2}
        max={6}
        value={2}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
