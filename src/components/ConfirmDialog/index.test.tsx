import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./index";

describe("ConfirmDialog component", () => {
  it("renders title, message and buttons when open", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Abandon Game?"
        message="All progress will be lost."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Abandon Game?")).toBeInTheDocument();
    expect(screen.getByText("All progress will be lost.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onConfirm and onCancel handlers", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Action"
        message="Are you sure?"
        confirmLabel="Yes, Do it"
        cancelLabel="No, Back"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes, Do it" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "No, Back" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
