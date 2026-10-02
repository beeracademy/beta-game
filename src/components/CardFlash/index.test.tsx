import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CardFlashProvider, resetBleedSuppression, useCardFlash } from "./index";

const TestComponent = () => {
  const { flash, hide, wasRecentlyDismissed } = useCardFlash();
  const [status, setStatus] = useState("no");
  return (
    <div>
      <button
        onClick={() => flash({ suit: "H", value: 10 }, { duration: 1000 })}
      >
        Flash Heart 10
      </button>
      <button onClick={hide}>Hide Flash</button>
      <button
        onClick={() => setStatus(wasRecentlyDismissed() ? "yes" : "no")}
      >
        Check Recently Dismissed
      </button>
      <span data-testid="recently-dismissed">{status}</span>
    </div>
  );
};

describe("CardFlash", () => {
  beforeEach(() => {
    resetBleedSuppression();
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetBleedSuppression();
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

  it("ensures the flashed card is not selectable and not draggable", () => {
    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    fireEvent.click(screen.getByText("Flash Heart 10"));
    const img = screen.getByRole("img");

    expect(img).toHaveAttribute("draggable", "false");
    expect(img).toHaveStyle({ userSelect: "none" });
  });

  it("dismisses the card faster when touched", () => {
    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    fireEvent.click(screen.getByText("Flash Heart 10"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const img = screen.getByRole("img");

    // Touch the card
    act(() => {
      fireEvent.touchStart(img);
      fireEvent.touchEnd(img);
    });

    // Advance by the fast dismissal duration (100ms) - well before 1000ms duration
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tracks wasRecentlyDismissed for 400ms after dismissal", () => {
    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    fireEvent.click(screen.getByText("Check Recently Dismissed"));
    expect(screen.getByTestId("recently-dismissed")).toHaveTextContent("no");

    fireEvent.click(screen.getByText("Flash Heart 10"));
    fireEvent.click(screen.getByText("Hide Flash"));

    fireEvent.click(screen.getByText("Check Recently Dismissed"));
    expect(screen.getByTestId("recently-dismissed")).toHaveTextContent("yes");

    act(() => {
      vi.advanceTimersByTime(450);
    });

    fireEvent.click(screen.getByText("Check Recently Dismissed"));
    expect(screen.getByTestId("recently-dismissed")).toHaveTextContent("no");
  });

  it("suppresses bleed-through click events on underlying elements after card touch", () => {
    const underlyingElement = document.createElement("button");
    const underlyingClickHandler = vi.fn();
    underlyingElement.addEventListener("click", underlyingClickHandler);
    document.body.appendChild(underlyingElement);

    render(
      <CardFlashProvider>
        <TestComponent />
      </CardFlashProvider>,
    );

    fireEvent.click(screen.getByText("Flash Heart 10"));
    const img = screen.getByRole("img");

    // Touch the card to trigger dismiss + bleed suppression
    act(() => {
      fireEvent.touchEnd(img);
    });

    // Dispatch a synthetic click event on an underlying element (mimicking browser ghost click)
    const ghostClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    underlyingElement.dispatchEvent(ghostClick);

    // The underlying element click handler was never reached
    expect(underlyingClickHandler).not.toHaveBeenCalled();

    document.body.removeChild(underlyingElement);
  });
});

