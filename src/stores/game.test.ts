import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame, { createInitialGameState } from "./game";
import type { Player } from "../models/player";
import * as GameAPI from "../api/endpoints/game";

vi.mock("../api/endpoints/game", () => ({
  postStart: vi.fn(),
  postUpdate: vi.fn().mockResolvedValue(undefined),
}));

describe("useGame store", () => {
  const mockPlayers: Player[] = [
    { id: 1, username: "Alice", token: "token-1" },
    { id: 2, username: "Bob", token: "token-2" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState(createInitialGameState());
  });

  const defaultOptions = {
    offline: true,
    numberOfRounds: 13,
    sipsInABeer: 14,
  };

  it("starts an offline game with generated shuffle indices", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);

    const state = useGame.getState();
    expect(state.offline).toBe(true);
    expect(state.players).toHaveLength(2);
    expect(state.shuffleIndices.length).toBe(2 * 13 - 1);
    expect(state.gameStartTimestamp).toBeGreaterThan(0);
    expect(state.draws).toEqual([]);
    expect(state.submitted).toBe(false);
  });

  it("starts an online game through GameAPI.postStart", async () => {
    const mockApiResponse = {
      id: 99,
      token: "game-token-123",
      start_datetime: "2026-09-02T12:00:00Z",
      shuffle_indices: Array.from({ length: 25 }, (_, i) => i % 5),
    };
    vi.mocked(GameAPI.postStart).mockResolvedValueOnce(mockApiResponse as any);

    await useGame.getState().Start(mockPlayers, {
      ...defaultOptions,
      offline: false,
    });

    const state = useGame.getState();
    expect(state.offline).toBe(false);
    expect(state.id).toBe(99);
    expect(state.token).toBe("game-token-123");
    expect(state.shuffleIndices).toEqual(mockApiResponse.shuffle_indices);
  });

  it("draws cards and tracks turnStartTimestamp", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);

    const [card1, cardsLeft1] = useGame.getState().DrawCard();
    expect(card1).toBeDefined();
    expect(cardsLeft1).toBe(2 * 13 - 1);
    expect(useGame.getState().draws).toHaveLength(1);
    expect(card1.start_delta_ms).toBeDefined();
  });

  it("handles chug flow on drawing an Ace (value 14)", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);

    // Manually push an Ace into draws
    useGame.setState({
      draws: [{ suit: "S", value: 14, start_delta_ms: 100 }],
    });

    // Cannot draw while chugging
    expect(() => useGame.getState().DrawCard()).toThrow(
      "Cannot draw a new card while chugging",
    );

    // Start chug
    const startTime = useGame.getState().StartChug();
    expect(startTime).toBeGreaterThan(0);
    const lastCardAfterStart =
      useGame.getState().draws[useGame.getState().draws.length - 1];
    expect(lastCardAfterStart.chug_start_start_delta_ms).toBeDefined();

    // Cannot start again
    expect(() => useGame.getState().StartChug()).toThrow(
      "Chug has already started",
    );

    // Stop chug
    const stopTime = useGame.getState().StopChug();
    expect(stopTime).toBeGreaterThan(0);
    const lastCardAfterStop =
      useGame.getState().draws[useGame.getState().draws.length - 1];
    expect(lastCardAfterStop.chug_end_start_delta_ms).toBeDefined();

    // Cannot stop again
    expect(() => useGame.getState().StopChug()).toThrow("Chug has already ended");
  });

  it("toggles and sets player DNF status", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);

    useGame.getState().SetPlayerDNF(0, true);
    expect(useGame.getState().dnf_player_indexes).toContain(0);

    useGame.getState().SetPlayerDNF(0, false);
    expect(useGame.getState().dnf_player_indexes).not.toContain(0);
  });

  it("submits game and marks as submitted", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);

    await useGame.getState().Submit({ description: "Great game!" });

    const state = useGame.getState();
    expect(state.submitted).toBe(true);
    expect(state.description).toBe("Great game!");
  });

  it("exits game and resets state", async () => {
    await useGame.getState().Start(mockPlayers, defaultOptions);
    useGame.getState().Exit({ dnf: true });

    const state = useGame.getState();
    expect(state.players).toEqual([]);
    expect(state.gameStartTimestamp).toBe(0);
  });

  it("resumes an existing game state", () => {
    const customState = {
      ...createInitialGameState(),
      id: 42,
      players: mockPlayers,
      gameStartTimestamp: 123456789,
    };

    useGame.getState().Resume(customState);
    expect(useGame.getState().id).toBe(42);
    expect(useGame.getState().gameStartTimestamp).toBe(123456789);
  });
});
