import { create } from "zustand";
import {
  getRankedCards,
  type RankedCardResponse,
} from "../api/endpoints/stats";

export interface RankedCardsState {
  rankedCards: Record<string, RankedCardResponse>;
  loaded: boolean;
  loading: boolean;
  fetchRankedCards: () => Promise<void>;
  getRankedPhoto: (suit: string, value: number) => string | undefined;
}

const useRankedCards = create<RankedCardsState>((set, get) => ({
  rankedCards: {},
  loaded: false,
  loading: false,
  fetchRankedCards: async () => {
    if (get().loading || get().loaded) {
      return;
    }
    set({ loading: true });
    try {
      const cards = await getRankedCards();
      set({ rankedCards: cards, loaded: true, loading: false });

      // Preload images so they appear instantly when cards flash or are hovered
      if (typeof Image !== "undefined") {
        for (const rankedCard of Object.values(cards)) {
          if (rankedCard?.user_image) {
            const image = new Image();
            image.src = rankedCard.user_image;
          }
        }
      }
    } catch {
      // Ranked cards are a cosmetic bonus; ignore failures
      set({ loading: false });
    }
  },
  getRankedPhoto: (suit: string, value: number) => {
    return get().rankedCards[`${suit}-${value}`]?.user_image;
  },
}));

export default useRankedCards;
