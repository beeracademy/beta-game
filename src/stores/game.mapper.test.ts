import { describe, expect, it } from "vitest";
import {
  deriveGameEndTimestamp,
  deriveTurnStartTimestamp,
  mapToLocal,
  mapToRemote,
} from "./game.mapper";
import { createInitialGameState, type GameState } from "./game";
import type { Game } from "../api/models/game";

describe("game.mapper", () => {
  const baseGameState: GameState = {
    ...createInitialGameState(),
    id: 123,
    token: "token-abc",
    gameStartDateString: "2026-09-02T10:00:00Z",
    gameStartTimestamp: 10000,
    players: [
      { id: 1, username: "Player1" },
      { id: 2, username: "Player2" },
    ],
    dnf_player_indexes: [1],
    draws: [
      { suit: "S", value: 10, start_delta_ms: 1000 },
      {
        suit: "H",
        value: 14,
        start_delta_ms: 2000,
        chug_start_start_delta_ms: 2500,
        chug_end_start_delta_ms: 7500,
      },
    ],
    shuffleIndices: [1, 2, 3],
  };

  it("maps local GameState to remote Game payload", () => {
    const remote = mapToRemote(baseGameState, {
      dnf: false,
      has_ended: true,
      description: "Awesome match",
    });

    expect(remote.id).toBe(123);
    expect(remote.token).toBe("token-abc");
    expect(remote.player_names).toEqual(["Player1", "Player2"]);
    expect(remote.player_ids).toEqual([1, 2]);
    expect(remote.dnf_player_ids).toEqual([2]);
    expect(remote.has_ended).toBe(true);
    expect(remote.description).toBe("Awesome match");
    expect(remote.cards).toHaveLength(2);
  });

  it("maps remote Game payload to local GameState", () => {
    const remoteGame: Game = {
      id: 456,
      token: "rem-token",
      start_datetime: "2026-09-02T14:00:00Z",
      player_names: ["Bob", "Alice"],
      player_ids: [10, 20],
      official: true,
      shuffle_indices: [0, 1],
      has_ended: false,
      cards: [{ suit: "D", value: 5, start_delta_ms: 500 }],
      dnf_player_ids: [20],
      dnf: false,
    };

    const local = mapToLocal(remoteGame);
    expect(local.id).toBe(456);
    expect(local.token).toBe("rem-token");
    expect(local.offline).toBe(false);
    expect(local.players).toHaveLength(2);
    expect(local.players[0].username).toBe("Bob");
    expect(local.dnf_player_indexes).toEqual([1]); // Player with id 20 is index 1
    expect(local.draws).toHaveLength(1);
  });

  it("derives turn start timestamp accurately", () => {
    const startMs = 10000;
    // Empty draws
    expect(deriveTurnStartTimestamp(startMs, [])).toBe(startMs);

    // Normal card
    expect(
      deriveTurnStartTimestamp(startMs, [
        { suit: "S", value: 5, start_delta_ms: 3000 },
      ]),
    ).toBe(13000);

    // Chug card completed
    expect(
      deriveTurnStartTimestamp(startMs, [
        {
          suit: "H",
          value: 14,
          start_delta_ms: 2000,
          chug_end_start_delta_ms: 6000,
        },
      ]),
    ).toBe(16000);
  });

  it("derives game end timestamp when game finishes", () => {
    const startMs = 10000;
    const cards = [
      { suit: "S" as const, value: 5 as const, start_delta_ms: 1000 },
      { suit: "C" as const, value: 9 as const, start_delta_ms: 3000 },
    ];

    // Not enough cards drawn yet
    expect(deriveGameEndTimestamp(startMs, cards, 3)).toBe(0);

    // Exactly matching cards count
    expect(deriveGameEndTimestamp(startMs, cards, 2)).toBe(13000);
  });
});
