import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthAPI from "../../../api/endpoints/authentication";
import * as GameAPI from "../../../api/endpoints/game";
import type { Game } from "../../../api/models/game";
import useGame, { createInitialGameState } from "../../../stores/game";
import ContinueGameView from "./index";

const playMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: playMock,
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../api/endpoints/authentication", () => ({
  login: vi.fn(),
}));

vi.mock("../../../api/endpoints/game", () => ({
  getResumableGames: vi.fn(),
  postResumeGame: vi.fn(),
}));

describe("ContinueGameView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useGame.setState(createInitialGameState());
  });

  const renderComponent = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ContinueGameView />
        </MemoryRouter>
      </HelmetProvider>,
    );

  it("renders login form and back navigation button initially", () => {
    renderComponent();

    expect(screen.getByText("Resume a game")).toBeInTheDocument();
    expect(screen.getByLabelText("username")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in to see games" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to new game" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.queryByText(/completed on this computer/i),
    ).not.toBeInTheDocument();
  });

  it("handles login failure with error alert and plays snack sound", async () => {
    vi.mocked(AuthAPI.login).mockRejectedValueOnce({
      response: {
        data: { detail: "Invalid username or password" },
      },
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "testplayer" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Sign in to see games" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password"),
      ).toBeInTheDocument();
    });

    expect(playMock).toHaveBeenCalledWith("snack");
  });

  it("logs in successfully and shows empty state when no resumable games exist", async () => {
    vi.mocked(AuthAPI.login).mockResolvedValueOnce({
      id: 1,
      token: "tok_abc",
      image: "/player.png",
    });
    vi.mocked(GameAPI.getResumableGames).mockResolvedValueOnce([]);

    renderComponent();

    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "secret" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Sign in to see games" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Signed in as")).toBeInTheDocument();
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(
        screen.getByText("There are no resumable games for this player"),
      ).toBeInTheDocument();
    });

    expect(GameAPI.getResumableGames).toHaveBeenCalledWith("tok_abc");
    expect(playMock).not.toHaveBeenCalled();
  });

  it("lists resumable games and resumes selected game upon confirmation", async () => {
    vi.mocked(AuthAPI.login).mockResolvedValueOnce({
      id: 42,
      token: "tok_user",
      image: "",
    });

    vi.mocked(GameAPI.getResumableGames).mockResolvedValueOnce([
      {
        id: 101,
        start_datetime: "2026-09-02T12:00:00Z",
        players: [
          { id: 42, username: "alice", image: "" },
          { id: 43, username: "bob", image: "" },
        ],
      },
    ]);

    const mockGame: Game = {
      id: 101,
      token: "game_tok_101",
      official: true,
      start_datetime: "2026-09-02T12:00:00Z",
      player_names: ["alice", "bob"],
      player_ids: [42, 43],
      cards: [],
      has_ended: false,
      dnf: false,
      dnf_player_ids: [],
      shuffle_indices: [0, 1],
    };

    vi.mocked(GameAPI.postResumeGame).mockResolvedValueOnce(mockGame);

    renderComponent();

    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "secret" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Sign in to see games" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Game #101")).toBeInTheDocument();
      expect(screen.getByText("alice, bob")).toBeInTheDocument();
    });

    // Click on the game to resume
    fireEvent.click(screen.getByText("Game #101"));

    await waitFor(() => {
      expect(GameAPI.postResumeGame).toHaveBeenCalledWith("tok_user", 101);
      expect(
        screen.getByText(/Are you sure you want to resume game 101/),
      ).toBeInTheDocument();
    });

    // Confirm dialog
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    // Verify game store state was updated
    expect(useGame.getState().id).toBe(101);
    expect(useGame.getState().token).toBe("game_tok_101");
    expect(useGame.getState().players).toHaveLength(2);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("allows signing out / changing player", async () => {
    vi.mocked(AuthAPI.login).mockResolvedValueOnce({
      id: 1,
      token: "tok_abc",
      image: "",
    });
    vi.mocked(GameAPI.getResumableGames).mockResolvedValueOnce([]);

    renderComponent();

    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "secret" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sign in to see games" }),
    );

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Change player" }));

    expect(screen.queryByText("Signed in as")).not.toBeInTheDocument();
    expect(screen.getByLabelText("username")).toBeInTheDocument();
  });
});
