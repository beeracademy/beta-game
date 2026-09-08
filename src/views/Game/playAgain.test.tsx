import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as GameAPI from "../../api/endpoints/game";
import type { Card } from "../../models/card";
import type { Player } from "../../models/player";
import useGame, { createInitialGameState } from "../../stores/game";
import { GenerateShuffleIndices } from "../../utilities/deck";
import GameView from "./index";

vi.mock("../../api/endpoints/game", () => ({
  postStart: vi.fn(),
  postUpdate: vi.fn().mockResolvedValue(undefined),
  addPhoto: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../components/CardFlash", () => ({
  useCardFlash: () => ({ flash: vi.fn(), hide: vi.fn(), show: false }),
}));

vi.mock("../../components/TextFlash", () => ({
  useTextFlash: () => ({ flash: vi.fn(), clear: vi.fn() }),
}));

vi.mock("../../api/websocket", () => ({
  default: () => ({
    ready: false,
    error: false,
    connect: vi.fn(),
    close: vi.fn(),
    send: vi.fn(),
    receive: vi.fn(),
  }),
}));

vi.mock("../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

vi.mock("../../hooks/camera", () => ({
  useVideoDevices: () => ({ devices: [] }),
}));

vi.mock("./components/Header", () => ({
  default: () => <div data-testid="mock-header" />,
}));
vi.mock("./components/CardInventory", () => ({
  default: () => <div data-testid="mock-card-inventory" />,
}));
vi.mock("./components/ChugsList", () => ({
  default: () => <div data-testid="mock-chugs-list" />,
}));
vi.mock("./components/Table", () => ({
  default: () => <div data-testid="mock-game-table" />,
}));
vi.mock("./components/Chart", () => ({
  default: () => <div data-testid="mock-chart" />,
}));
vi.mock("./components/PlayerList", () => ({
  default: () => <div data-testid="mock-player-list" />,
}));
vi.mock("../../components/Terminal", () => ({
  default: () => <div data-testid="mock-terminal" />,
}));
vi.mock("../../components/MemeDialog", () => ({
  default: () => <div data-testid="mock-meme-dialog" />,
}));
vi.mock("../../components/GameChat", () => ({
  GameChat: () => <div data-testid="mock-game-chat" />,
}));
vi.mock("./components/MobileNowDrawing", () => ({
  default: () => <div data-testid="mock-mobile-now-drawing" />,
}));
vi.mock("./components/MobileStandings", () => ({
  default: () => <div data-testid="mock-mobile-standings" />,
}));
vi.mock("./components/ChugDialog", () => ({
  default: () => <div data-testid="mock-chug-dialog" />,
}));

const samplePlayers: Player[] = [
  { id: 101, username: "Alice", token: "tok1" },
  { id: 102, username: "Bob", token: "tok2" },
];

// Non-ace draws only, so the game finishes without a pending chug
const finishedDraws = (): Card[] =>
  Array.from({ length: samplePlayers.length * 13 }, (_, i) => ({
    value: 2 as const,
    suit: "S" as const,
    start_delta_ms: (i + 1) * 1000,
  }));

const renderGame = () =>
  render(
    <MemoryRouter>
      <GameView />
    </MemoryRouter>,
  );

const finishGame = async () => {
  act(() => {
    useGame.setState({ draws: finishedDraws(), gameEndTimestamp: Date.now() });
  });

  await screen.findByRole("button", {
    name: /play again with the same people/i,
  });
};

describe("Play again with the same people", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useGame.setState(createInitialGameState());
  });

  it("shows a fresh finished dialog after replaying an offline game", async () => {
    await act(async () => {
      await useGame.getState().Start(samplePlayers, {
        sipsInABeer: 14,
        numberOfRounds: 13,
        offline: true,
      });
    });

    renderGame();

    await finishGame();

    const firstStart = useGame.getState().gameStartTimestamp;

    fireEvent.click(
      screen.getByRole("button", {
        name: /play again with the same people/i,
      }),
    );

    await waitFor(() => {
      expect(useGame.getState().draws).toEqual([]);
    });

    // The dialog must go away for the new game
    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: /play again with the same people/i,
        }),
      ).not.toBeInTheDocument();
    });

    expect(useGame.getState().gameStartTimestamp).not.toBe(firstStart);

    // Finishing the second game must show the dialog again, not a stuck
    // "Starting new game..." button from the previous round
    await finishGame();

    expect(
      screen.queryByRole("button", { name: /starting new game/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /play again with the same people/i }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: /exit game/i })).toBeEnabled();
  });

  it("shows the full summary step again after replaying an online game", async () => {
    vi.mocked(GameAPI.postStart).mockImplementation(
      async () =>
        ({
          id: 1,
          token: "game-token-1",
          start_datetime: new Date().toISOString(),
          shuffle_indices: GenerateShuffleIndices(samplePlayers.length),
        }) as any,
    );

    await act(async () => {
      await useGame.getState().Start(samplePlayers, {
        sipsInABeer: 14,
        numberOfRounds: 13,
        offline: false,
      });
    });

    renderGame();

    act(() => {
      useGame.setState({
        draws: finishedDraws(),
        gameEndTimestamp: Date.now(),
      });
    });

    // Online games start on the photo/description summary step
    const notes = await screen.findByPlaceholderText(
      /any last words before the hangover/i,
    );
    fireEvent.change(notes, { target: { value: "First game notes" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const playAgain = await screen.findByRole("button", {
      name: /play again with the same people/i,
    });

    vi.mocked(GameAPI.postStart).mockResolvedValueOnce({
      id: 2,
      token: "game-token-2",
      start_datetime: new Date(Date.now() + 60_000).toISOString(),
      shuffle_indices: GenerateShuffleIndices(samplePlayers.length),
    } as any);

    fireEvent.click(playAgain);

    await waitFor(() => {
      expect(useGame.getState().id).toBe(2);
    });

    expect(useGame.getState().draws).toEqual([]);
    expect(useGame.getState().description).toBeUndefined();
    expect(useGame.getState().submitted).toBe(false);

    // Finishing the second game must land on the summary step again with an
    // empty description, not on the previous game's choices step
    act(() => {
      useGame.setState({
        draws: finishedDraws(),
        gameEndTimestamp: Date.now(),
      });
    });

    const secondNotes = await screen.findByPlaceholderText(
      /any last words before the hangover/i,
    );
    expect(secondNotes).toHaveValue("");
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });
});
