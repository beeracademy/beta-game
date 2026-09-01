import { beforeEach, describe, expect, it } from "vitest";
import useGamesPlayed from "./gamesPlayed";

describe("gamesPlayed store", () => {
  beforeEach(() => {
    localStorage.clear();
    useGamesPlayed.setState({
      started: 0,
      completed: 0,
    });
  });

  it("should default to 0 started and completed", () => {
    expect(useGamesPlayed.getState().started).toBe(0);
    expect(useGamesPlayed.getState().completed).toBe(0);
  });

  it("should increment started and completed counts", () => {
    const { incrementStarted, incrementCompleted } = useGamesPlayed.getState();

    incrementStarted();
    incrementStarted();
    expect(useGamesPlayed.getState().started).toBe(2);

    incrementCompleted();
    expect(useGamesPlayed.getState().completed).toBe(1);
  });

  it("should reset started and completed counts to 0", () => {
    const { incrementStarted, incrementCompleted, reset } =
      useGamesPlayed.getState();

    incrementStarted();
    incrementStarted();
    incrementCompleted();
    expect(useGamesPlayed.getState().started).toBe(2);
    expect(useGamesPlayed.getState().completed).toBe(1);

    reset();
    expect(useGamesPlayed.getState().started).toBe(0);
    expect(useGamesPlayed.getState().completed).toBe(0);
  });

  it("should persist counts to localStorage", () => {
    const { incrementStarted, incrementCompleted } = useGamesPlayed.getState();
    incrementStarted();
    incrementCompleted();

    const raw = localStorage.getItem("computer-game-counts");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.started).toBe(1);
    expect(parsed.state.completed).toBe(1);
  });
});
