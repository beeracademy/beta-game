import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileViewSelector } from "./MobileViewSelector";

describe("MobileViewSelector", () => {
  it("renders all 4 tabs", () => {
    render(
      <MobileViewSelector
        activeView="players"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /players/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cards/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /chugs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /graph/i })).toBeInTheDocument();
  });

  it("calls onChange when a tab is clicked", () => {
    const handleChange = vi.fn();
    render(
      <MobileViewSelector
        activeView="players"
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cards/i }));
    expect(handleChange).toHaveBeenCalledWith("cards");

    fireEvent.click(screen.getByRole("button", { name: /chugs/i }));
    expect(handleChange).toHaveBeenCalledWith("chugs");

    fireEvent.click(screen.getByRole("button", { name: /graph/i }));
    expect(handleChange).toHaveBeenCalledWith("graph");
  });
});
