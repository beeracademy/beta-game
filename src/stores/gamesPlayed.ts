import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ComputerGamesCountState {
  started: number;
  completed: number;
  incrementStarted: () => void;
  incrementCompleted: () => void;
  reset: () => void;
}

const useGamesPlayed = create<ComputerGamesCountState>()(
  persist(
    (set) => ({
      started: 0,
      completed: 0,
      incrementStarted: () => set((state) => ({ started: state.started + 1 })),
      incrementCompleted: () =>
        set((state) => ({ completed: state.completed + 1 })),
      reset: () => set({ started: 0, completed: 0 }),
    }),
    {
      name: "computer-game-counts",
    },
  ),
);

export default useGamesPlayed;
