import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TextFlashProvider, useTextFlash } from "./index";

const TestComponent = () => {
  const { flash, clear } = useTextFlash();
  return (
    <div>
      <button onClick={() => flash("DOUBLE KILL!!", { duration: 1500 })}>
        Flash Text
      </button>
      <button onClick={clear}>Clear Text</button>
    </div>
  );
};

describe("TextFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flashes banner and auto-advances after duration", () => {
    render(
      <TextFlashProvider>
        <TestComponent />
      </TextFlashProvider>,
    );

    expect(screen.queryByText("DOUBLE KILL!!")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Flash Text"));
    expect(screen.getByText("DOUBLE KILL!!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText("DOUBLE KILL!!")).not.toBeInTheDocument();
  });

  it("clears banner queue immediately", () => {
    render(
      <TextFlashProvider>
        <TestComponent />
      </TextFlashProvider>,
    );

    fireEvent.click(screen.getByText("Flash Text"));
    expect(screen.getByText("DOUBLE KILL!!")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear Text"));
    expect(screen.queryByText("DOUBLE KILL!!")).not.toBeInTheDocument();
  });
});
