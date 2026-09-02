import { useEffect, useRef } from "react";
import { useTextFlash } from "../../../components/TextFlash";
import {
  pickJesterMessage,
  pickKingMessage,
} from "../../../components/TextFlash/messages";
import type { Card } from "../../../models/card";
import type { Player } from "../../../models/player";
import type { PlayerMetrics } from "../../../stores/metrics";

interface UseLeaderboardAnnouncerOptions {
  playerMetrics: PlayerMetrics[];
  cards: Card[];
  players: Player[];
  currentRound: number;
  chugging: boolean;
  textFlasher: ReturnType<typeof useTextFlash>;
}

export const useLeaderboardAnnouncer = ({
  playerMetrics,
  cards,
  players,
  currentRound,
  chugging,
  textFlasher,
}: UseLeaderboardAnnouncerOptions) => {
  // Tracks card count to ensure King/Jester flashes only fire on an actual card draw,
  // and never during initial mount / tab reload.
  const prevCardsCountRef = useRef(cards.length);
  const leaderboardRef = useRef<{ leader: number; jester: number }>({
    leader: playerMetrics.findIndex((p) => p.isLeading),
    jester: playerMetrics.findIndex((p) => p.isLast),
  });

  useEffect(() => {
    const leaderIndex = playerMetrics.findIndex((p) => p.isLeading);
    const jesterIndex = playerMetrics.findIndex((p) => p.isLast);

    const cardsCount = cards.length;
    const cardWasDrawn = cardsCount > prevCardsCountRef.current;
    prevCardsCountRef.current = cardsCount;

    // Round 1 never has a King/Jester yet, just record the baseline
    if (currentRound === 1 || playerMetrics.length === 0) {
      leaderboardRef.current = { leader: leaderIndex, jester: jesterIndex };
      return;
    }

    // Only announce King/Jester when an actual card draw caused the change
    if (!cardWasDrawn) {
      leaderboardRef.current = { leader: leaderIndex, jester: jesterIndex };
      return;
    }

    // Do not announce King/Jester when chugging (e.g. Ace drawn / ChugDialog open)
    if (chugging || cards[cards.length - 1]?.value === 14) {
      leaderboardRef.current = { leader: leaderIndex, jester: jesterIndex };
      return;
    }

    const prev = leaderboardRef.current;

    if (leaderIndex !== -1 && leaderIndex !== prev.leader) {
      const name = players[leaderIndex]?.username;
      if (name) {
        textFlasher.flash(pickKingMessage(name), { variant: "king" });
      }
    }

    if (jesterIndex !== -1 && jesterIndex !== prev.jester) {
      const name = players[jesterIndex]?.username;
      if (name) {
        textFlasher.flash(pickJesterMessage(name), { variant: "jester" });
      }
    }

    leaderboardRef.current = { leader: leaderIndex, jester: jesterIndex };
  }, [playerMetrics, currentRound, chugging, cards, players, textFlasher]);
};
