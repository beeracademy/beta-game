import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import useGame, { createInitialGameState } from "../../../stores/game";
import { MobileChugsView } from "./MobileChugsView";

describe("MobileChugsView component", () => {
  beforeEach(() => {
    useGame.setState({
      ...createInitialGameState(),
      players: [
        { id: 1, username: "Alice" },
        { id: 2, username: "Bob" },
      ],
      draws: [],
    });
  });

  it("shows dashed pending slots when no chugs have been completed", () => {
    render(<MobileChugsView />);
    expect(screen.getByText("chug 1")).toBeInTheDocument();
    expect(screen.getByText("chug 2")).toBeInTheDocument();
  });

  it("renders completed chug card and remaining pending chugs", () => {
    useGame.setState({
      draws: [
        {
          value: 14,
          suit: "S",
          chug_start_start_delta_ms: 1000,
          chug_end_start_delta_ms: 4500,
        },
      ],
    });

    render(<MobileChugsView />);
    expect(screen.getByTestId("mobile-chug-item-0")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("chug 2")).toBeInTheDocument();
  });
});
