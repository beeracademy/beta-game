import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CardFlashProvider, useCardFlash } from "./index";

const TestComponent = () => {
  const { flash, hide } = useCardFlash();
  return (
    <div>
      <button
        onClick={() => flash({ suit: "H", value: 10 }, { duration: 1000 })}
      >
        Flash Heart 10
      </button>
      <button onClick={hide}>Hide Flash</button>
    </div>
  );
};

describe("CardFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flashes card dialog and hides after duration", () => {
    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Flash Heart 10"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/cards/H-10.png");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows hiding early with hide()", () => {
    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    fireEvent.click(screen.getByText("Flash Heart 10"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide Flash"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
