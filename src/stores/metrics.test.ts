import { beforeEach, describe, expect, it } from "vitest";
import { Card } from "../models/card";
import { Player } from "../models/player";
import { GenerateShuffleIndices } from "../utilities/deck";
import useGame from "./game";
import {
  calculateLeaderboard,
  calculatePlayerChugs,
  calculatePlayerSips,
  calculatePlayerTurnTimes,
  DEFAULT_PLAYER_METRICS,
  MetricsStore,
} from "./metrics";

describe("Metrics Store & Derivation", () => {
  const samplePlayers: Player[] = [
    { id: 1, username: "Alice" },
    { id: 2, username: "Bob" },
  ];

  beforeEach(() => {
    localStorage.clear();
    useGame.getState().Exit();
    MetricsStore.getState().Update();
  });

  describe("Store reset behavior", () => {
    it("resets metrics when game has no players", () => {
      expect(MetricsStore.getState().players).toEqual([]);
      expect(MetricsStore.getState().game.numberOfPlayers).toBe(0);
      expect(MetricsStore.getState().game.numberOfCardsDrawn).toBe(0);
      expect(MetricsStore.getState().game.done).toBe(false);
    });

    it("has complete fields in DEFAULT_PLAYER_METRICS", () => {
      expect(DEFAULT_PLAYER_METRICS.cardsDrawn).toBe(0);
      expect(DEFAULT_PLAYER_METRICS.numberOfBeers).toBe(0);
      expect(DEFAULT_PLAYER_METRICS.numberOfChugs).toBe(0);
      expect(DEFAULT_PLAYER_METRICS.totalSips).toBe(0);
      expect(DEFAULT_PLAYER_METRICS.isLeading).toBe(false);
      expect(DEFAULT_PLAYER_METRICS.isLast).toBe(false);
    });
  });

  describe("Turn time calculations & timing leak prevention", () => {
    it("calculates normal turn durations without chugs", () => {
      const draws: Card[] = [
        { value: 5, suit: "S", start_delta_ms: 2000 },
        { value: 7, suit: "H", start_delta_ms: 5000 },
        { value: 3, suit: "D", start_delta_ms: 9000 },
      ];

      const times = calculatePlayerTurnTimes(2, draws);
      // Player 0: Card 0 (0 to 2000 = 2000ms) + Card 2 (5000 to 9000 = 4000ms) = 6000ms
      expect(times[0]).toBe(6000);
      // Player 1: Card 1 (2000 to 5000 = 3000ms)
      expect(times[1]).toBe(3000);
    });

    it("does not leak previous player's chug time to the next player", () => {
      const draws: Card[] = [
        // Player 0 draws Ace at 2000ms, finishes chug at 12000ms (10s chug)
        {
          value: 14,
          suit: "H",
          start_delta_ms: 2000,
          chug_start_start_delta_ms: 3000,
          chug_end_start_delta_ms: 12000,
        },
        // Player 1 takes 3 seconds and draws at 15000ms
        {
          value: 4,
          suit: "C",
          start_delta_ms: 15000,
        },
      ];

      const times = calculatePlayerTurnTimes(2, draws);
      // Player 0 should have 0 to 12000 = 12000ms (includes the chug)
      expect(times[0]).toBe(12000);
      // Player 1 should only be charged from Player 0's chug end (12000ms to 15000ms = 3000ms)
      expect(times[1]).toBe(3000);
    });

    it("does not finalize turn duration for Ace while chug is still in progress", () => {
      const draws: Card[] = [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 2000,
          chug_start_start_delta_ms: 3000,
          // chug_end_start_delta_ms is undefined
        },
      ];

      const times = calculatePlayerTurnTimes(2, draws);
      expect(times[0]).toBe(0);
      expect(times[1]).toBe(0);
    });
  });

  describe("Sips and Chugs derivation", () => {
    it("calculates cumulative and total sips and beer count accurately", () => {
      const draws: Card[] = [
        { value: 10, suit: "S" }, // P0: 10
        { value: 4, suit: "C" }, // P1: 4
        { value: 8, suit: "H" }, // P0: 10 + 8 = 18
        { value: 14, suit: "D" }, // P1: 4 + 14 = 18
      ];

      const { cumulativeSips, totalSips, numberOfBeers } = calculatePlayerSips(
        2,
        draws,
        14,
      );

      expect(cumulativeSips[0]).toEqual([0, 10, 18]);
      expect(cumulativeSips[1]).toEqual([0, 4, 18]);
      expect(totalSips).toEqual([18, 18]);
      expect(numberOfBeers).toEqual([1, 1]);
    });

    it("counts chugs correctly", () => {
      const draws: Card[] = [
        { value: 14, suit: "S" }, // P0: chug 1
        { value: 5, suit: "C" },
        { value: 14, suit: "H" }, // P0: chug 2
        { value: 14, suit: "D" }, // P1: chug 1
      ];

      const chugs = calculatePlayerChugs(2, draws);
      expect(chugs).toEqual([2, 1]);
    });
  });

  describe("Leaderboard and ties handling", () => {
    it("assigns crown to leader and jester to last player when no tie", () => {
      const { isLeading, isLast } = calculateLeaderboard([30, 10, 20]);
      expect(isLeading).toEqual([true, false, false]);
      expect(isLast).toEqual([false, true, false]);
    });

    it("shares crown between tied leaders", () => {
      const { isLeading, isLast } = calculateLeaderboard([30, 30, 10]);
      expect(isLeading).toEqual([true, true, false]);
      expect(isLast).toEqual([false, false, true]);
    });

    it("shares jester between tied last players", () => {
      const { isLeading, isLast } = calculateLeaderboard([30, 10, 10]);
      expect(isLeading).toEqual([true, false, false]);
      expect(isLast).toEqual([false, true, true]);
    });

    it("does not assign crown or jester if all players have equal sips", () => {
      const { isLeading, isLast } = calculateLeaderboard([20, 20, 20]);
      expect(isLeading).toEqual([false, false, false]);
      expect(isLast).toEqual([false, false, false]);
    });
  });

  describe("Full Store Integration", () => {
    it("updates metrics on card draws and maintains derived state", async () => {
      // Deterministic shuffle indices ensuring first card drawn is not an Ace (which would trigger chugging)
      const shuffle = Array.from(
        { length: samplePlayers.length * 13 - 1 },
        (_, i) => 0,
      );
      await useGame.getState().Start(samplePlayers, {
        sipsInABeer: 14,
        numberOfRounds: 13,
        offline: true,
      });

      useGame.setState({ shuffleIndices: shuffle });
      MetricsStore.getState().Update();

      expect(MetricsStore.getState().game.numberOfPlayers).toBe(2);
      expect(MetricsStore.getState().game.currentRound).toBe(1);
      expect(MetricsStore.getState().game.done).toBe(false);

      // Draw first card
      useGame.getState().DrawCard();

      expect(MetricsStore.getState().game.numberOfCardsDrawn).toBe(1);
      expect(MetricsStore.getState().game.activePlayerIndex).toBe(1);
      expect(MetricsStore.getState().players[0].cardsDrawn).toBe(1);
      expect(MetricsStore.getState().players[1].cardsDrawn).toBe(0);

      // Exit game and verify clean reset
      useGame.getState().Exit();
      expect(MetricsStore.getState().players).toEqual([]);
      expect(MetricsStore.getState().game.numberOfPlayers).toBe(0);
    });
  });
});
