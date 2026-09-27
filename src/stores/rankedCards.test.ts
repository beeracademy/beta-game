import { beforeEach, describe, expect, it, vi } from "vitest";
import * as statsApi from "../api/endpoints/stats";
import useRankedCards from "./rankedCards";

describe("useRankedCards store", () => {
  beforeEach(() => {
    useRankedCards.setState({
      rankedCards: {},
      loaded: false,
      loading: false,
    });
    vi.restoreAllMocks();
  });

  it("fetches and stores ranked cards successfully", async () => {
    const mockData: Record<string, statsApi.RankedCardResponse> = {
      "S-12": {
        user_id: 42,
        user_username: "Alice",
        user_image: "/avatars/alice.png",
        ranking_name: "Queen of Spades",
        ranking_value: "100",
      },
    };

    vi.spyOn(statsApi, "getRankedCards").mockResolvedValue(mockData);

    await useRankedCards.getState().fetchRankedCards();

    expect(useRankedCards.getState().loaded).toBe(true);
    expect(useRankedCards.getState().loading).toBe(false);
    expect(useRankedCards.getState().rankedCards).toEqual(mockData);
    expect(useRankedCards.getState().getRankedPhoto("S", 12)).toBe(
      "/avatars/alice.png",
    );
    expect(useRankedCards.getState().getRankedPhoto("H", 12)).toBeUndefined();
  });

  it("handles fetch failure gracefully without throwing", async () => {
    vi.spyOn(statsApi, "getRankedCards").mockRejectedValue(
      new Error("Network error"),
    );

    await useRankedCards.getState().fetchRankedCards();

    expect(useRankedCards.getState().loaded).toBe(false);
    expect(useRankedCards.getState().loading).toBe(false);
    expect(useRankedCards.getState().rankedCards).toEqual({});
  });

  it("does not refetch if already loaded or currently loading", async () => {
    const getSpy = vi.spyOn(statsApi, "getRankedCards").mockResolvedValue({});

    useRankedCards.setState({ loaded: true });
    await useRankedCards.getState().fetchRankedCards();
    expect(getSpy).not.toHaveBeenCalled();

    useRankedCards.setState({ loaded: false, loading: true });
    await useRankedCards.getState().fetchRankedCards();
    expect(getSpy).not.toHaveBeenCalled();
  });
});
