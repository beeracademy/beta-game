import { beforeEach, describe, expect, it } from "vitest";
import { Card } from "../models/card";
import { Player } from "../models/player";
import { GenerateShuffleIndices } from "../utilities/deck";
import useGame from "./game";
import {
  deriveGameEndTimestamp,
  deriveTurnStartTimestamp,
  mapToLocal,
  mapToRemote,
} from "./game.mapper";
import { MetricsStore } from "./metrics";

describe("Game state derivation & refresh resilience", () => {
  const samplePlayers: Player[] = [
    { id: 1, username: "Alice" },
    { id: 2, username: "Bob" },
  ];

  beforeEach(() => {
    localStorage.clear();
    useGame.setState({
      id: undefined,
      offline: true,
      token: undefined,
      shuffleIndices: [],
      sipsInABeer: 14,
      numberOfRounds: 13,
      gameStartDateString: "",
      gameStartTimestamp: 0,
      gameEndTimestamp: 0,
      turnStartTimestamp: 0,
      players: [],
      dnf_player_indexes: [],
      draws: [],
      description: undefined,
      image: undefined,
    });
    MetricsStore.getState().Update();
  });

  describe("timestamp derivation", () => {
    it("derives turnStartTimestamp when no cards drawn", () => {
      const start = 100000;
      expect(deriveTurnStartTimestamp(start, [])).toBe(start);
    });

    it("derives turnStartTimestamp from last normal card", () => {
      const start = 100000;
      const draws: Card[] = [
        { value: 5, suit: "S", start_delta_ms: 1200 },
        { value: 9, suit: "C", start_delta_ms: 3500 },
      ];
      expect(deriveTurnStartTimestamp(start, draws)).toBe(start + 3500);
    });

    it("derives turnStartTimestamp from completed chug card", () => {
      const start = 100000;
      const draws: Card[] = [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 2000,
          chug_start_start_delta_ms: 3000,
          chug_end_start_delta_ms: 7500,
        },
      ];
      expect(deriveTurnStartTimestamp(start, draws)).toBe(start + 7500);
    });

    it("derives turnStartTimestamp when chug is in progress", () => {
      const start = 100000;
      const draws: Card[] = [
        {
          value: 14,
          suit: "H",
          start_delta_ms: 2000,
          chug_start_start_delta_ms: 3000,
        },
      ];
      expect(deriveTurnStartTimestamp(start, draws)).toBe(start + 2000);
    });

    it("derives gameEndTimestamp only when all cards are drawn", () => {
      const start = 100000;
      const draws: Card[] = [
        { value: 5, suit: "S", start_delta_ms: 1000 },
      ];
      expect(deriveGameEndTimestamp(start, draws, 26)).toBe(0);

      const fullDraws: Card[] = Array.from({ length: 26 }, (_, i) => ({
        value: 2 as const,
        suit: "S" as const,
        start_delta_ms: 1000 * (i + 1),
      }));
      expect(deriveGameEndTimestamp(start, fullDraws, 26)).toBe(start + 26000);
    });
  });

  describe("mapToLocal & mapToRemote", () => {
    it("correctly maps server Game with players array to local GameState", () => {
      const serverGame: any = {
        id: 42,
        token: "tok_123",
        official: true,
        start_datetime: "2026-09-01T12:00:00.000Z",
        shuffle_indices: [0, 1, 2],
        cards: [
          { value: 7, suit: "S", start_delta_ms: 5000 },
        ],
        players: [
          { id: 101, username: "Player1", image: "/img1.jpg" },
          { id: 102, username: "Player2", image: "/img2.jpg" },
        ],
        dnf_player_ids: [102],
        description: "Great game!",
        image: "data:image/jpeg;base64,sample",
      };

      const local = mapToLocal(serverGame);
      expect(local.id).toBe(42);
      expect(local.token).toBe("tok_123");
      expect(local.players).toHaveLength(2);
      expect(local.players[0].username).toBe("Player1");
      expect(local.players[1].username).toBe("Player2");
      expect(local.dnf_player_indexes).toEqual([1]);
      expect(local.description).toBe("Great game!");
      expect(local.image).toBe("data:image/jpeg;base64,sample");
      expect(local.turnStartTimestamp).toBe(Date.parse(serverGame.start_datetime) + 5000);
    });

    it("maps local state to remote including description and dnf", () => {
      const state = {
        ...useGame.getState(),
        id: 42,
        token: "tok_123",
        players: samplePlayers,
        description: "Victory notes",
      };
      const remote = mapToRemote(state, {
        dnf: false,
        has_ended: true,
      });

      expect(remote.id).toBe(42);
      expect(remote.token).toBe("tok_123");
      expect(remote.description).toBe("Victory notes");
      expect(remote.has_ended).toBe(true);
    });
  });

  describe("Chug dialog state derivation", () => {
    it("handles drawing Ace, starting chug, and ending chug", async () => {
      const shuffle = GenerateShuffleIndices(samplePlayers.length);
      await useGame.getState().Start(samplePlayers, {
        sipsInABeer: 14,
        numberOfRounds: 13,
        offline: true,
      });

      // Force state shuffleIndices
      useGame.setState({ shuffleIndices: shuffle });

      // Draw until we have a chug card or mock a chug draw
      const aceCard: Card = {
        value: 14,
        suit: "H",
        start_delta_ms: 10000,
      };

      useGame.setState({ draws: [aceCard] });
      MetricsStore.getState().Update();

      // Verify metrics state: chugging is true
      let metrics = MetricsStore.getState().game;
      expect(metrics.chugging).toBe(true);
      expect(metrics.activePlayerIndex).toBe(0); // Player 0 drew it

      // Simulate refresh during unstarted chug
      const persisted = JSON.parse(JSON.stringify(useGame.getState()));
      useGame.getState().Resume(persisted);
      MetricsStore.getState().Update();

      metrics = MetricsStore.getState().game;
      expect(metrics.chugging).toBe(true);
      expect(metrics.latestCard?.chug_start_start_delta_ms).toBeUndefined();

      // Start chug
      useGame.getState().StartChug();
      expect(useGame.getState().draws[0].chug_start_start_delta_ms).toBeDefined();

      // Simulate refresh during chug in progress
      const persistedMidChug = JSON.parse(JSON.stringify(useGame.getState()));
      useGame.getState().Resume(persistedMidChug);
      MetricsStore.getState().Update();

      metrics = MetricsStore.getState().game;
      expect(metrics.chugging).toBe(true);
      expect(metrics.latestCard?.chug_start_start_delta_ms).toBeDefined();
      expect(metrics.latestCard?.chug_end_start_delta_ms).toBeUndefined();

      // Stop chug
      useGame.getState().StopChug();
      MetricsStore.getState().Update();

      metrics = MetricsStore.getState().game;
      expect(metrics.chugging).toBe(false);
      expect(metrics.latestCard?.chug_end_start_delta_ms).toBeDefined();
    });
  });

  describe("Game Finished & photo/description persistence", () => {
    it("persists description and image across state reload", async () => {
      await useGame.getState().Start(samplePlayers, {
        sipsInABeer: 14,
        numberOfRounds: 13,
        offline: true,
      });

      useGame.getState().SetDescription("Epic victory celebration");
      useGame.getState().SetImage("data:image/jpeg;base64,victory_pic_data");

      expect(useGame.getState().description).toBe("Epic victory celebration");
      expect(useGame.getState().image).toBe("data:image/jpeg;base64,victory_pic_data");

      // Simulate page refresh / restart
      const snapshot = JSON.parse(JSON.stringify(useGame.getState()));
      useGame.getState().Resume(snapshot);

      expect(useGame.getState().description).toBe("Epic victory celebration");
      expect(useGame.getState().image).toBe("data:image/jpeg;base64,victory_pic_data");
    });

    it("derives done state and keeps GameFinishedDialog open when all cards drawn", () => {
      const totalCards = samplePlayers.length * 13;
      const draws: Card[] = Array.from({ length: totalCards }, (_, i) => ({
        value: 2 as const,
        suit: "S" as const,
        start_delta_ms: (i + 1) * 2000,
      }));

      useGame.setState({
        gameStartTimestamp: 1000000,
        players: samplePlayers,
        shuffleIndices: GenerateShuffleIndices(samplePlayers.length),
        draws,
      });

      MetricsStore.getState().Update();

      const metrics = MetricsStore.getState().game;
      expect(metrics.done).toBe(true);
      expect(metrics.chugging).toBe(false);

      // Verify that condition for GameFinishedDialog is met
      const showFinishedDialog = metrics.done && !metrics.chugging;
      expect(showFinishedDialog).toBe(true);

      // Verify that after simulated refresh, it remains true
      const snapshot = JSON.parse(JSON.stringify(useGame.getState()));
      useGame.getState().Resume(snapshot);
      MetricsStore.getState().Update();

      const rehydratedMetrics = MetricsStore.getState().game;
      expect(rehydratedMetrics.done && !rehydratedMetrics.chugging).toBe(true);
    });
  });
});
