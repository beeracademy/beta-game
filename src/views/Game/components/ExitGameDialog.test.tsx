import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExitGameDialog from "./ExitGameDialog";

describe("ExitGameDialog", () => {
  it("renders abandon game message when open", () => {
    render(<ExitGameDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Abandon game")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to abandon the game?"),
    ).toBeInTheDocument();
  });

  it("calls onClose with ok: true on confirm", () => {
    const onClose = vi.fn();
    render(<ExitGameDialog open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onClose).toHaveBeenCalledWith({ ok: true }, "backdropClick");
  });

  it("calls onClose with ok: false on cancel", () => {
    const onClose = vi.fn();
    render(<ExitGameDialog open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledWith({ ok: false }, "backdropClick");
  });
});
