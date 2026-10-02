import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NewGameProvider } from "../contexts/newGame";
import NewGameForm from "./Form";

vi.mock("../../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

vi.mock("../../../../api/endpoints/authentication", () => ({
  login: vi.fn(async (username: string) => {
    return {
      id: username === "Player1" ? 1 : 2,
      token: `token-${username}`,
      image: "avatar.png",
    };
  }),
}));

describe("NewGameForm", () => {
  it("renders 'Resume a game' button pointing to /login/resume", () => {
    render(
      <MemoryRouter>
        <NewGameProvider>
          <NewGameForm />
        </NewGameProvider>
      </MemoryRouter>,
    );

    const continueLink = screen.getByRole("link", {
      name: "Resume a game",
    });
    expect(continueLink).toBeInTheDocument();
    expect(continueLink).toHaveAttribute("href", "/login/resume");
  });

  it("does not crash when increasing player count while typing password for player 2", async () => {
    const { fireEvent, waitFor } = await import("@testing-library/react");

    render(
      <MemoryRouter>
        <NewGameProvider>
          <NewGameForm />
        </NewGameProvider>
      </MemoryRouter>,
    );

    // 1. Select 2 players
    const btn2 = screen.getByRole("button", { name: "2" });
    fireEvent.click(btn2);

    let usernameInputs = screen.getAllByLabelText("username");
    let passwordInputs = screen.getAllByLabelText("password");
    expect(usernameInputs).toHaveLength(2);

    // 2. Log in player 1
    fireEvent.change(usernameInputs[0], { target: { value: "Player1" } });
    fireEvent.change(passwordInputs[0], { target: { value: "pass1" } });
    fireEvent.keyDown(passwordInputs[0], { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(usernameInputs[0]).toBeDisabled();
    });

    // 3. Write username and password for player 2 but don't submit yet
    fireEvent.change(usernameInputs[1], { target: { value: "Player2" } });
    fireEvent.change(passwordInputs[1], { target: { value: "pass2" } });

    // 4. Increase count to 3 players (this blurs password input and triggers login)
    const btn3 = screen.getByRole("button", { name: "3" });
    fireEvent.click(btn3);

    // 5. Verify no crash occurs and 3 player slots exist
    await waitFor(() => {
      const updatedUsernameInputs = screen.getAllByLabelText("username");
      expect(updatedUsernameInputs).toHaveLength(3);
    });
  });

  it("preserves player 2 username typed while player 1 login is in progress", async () => {
    const { fireEvent, waitFor } = await import("@testing-library/react");
    const AuthAPI = await import("../../../../api/endpoints/authentication");

    let resolvePlayer1Login: (value: any) => void = () => {};
    const player1Promise = new Promise((resolve) => {
      resolvePlayer1Login = resolve;
    });

    vi.mocked(AuthAPI.login).mockImplementation(async (username: string) => {
      if (username === "Player1") {
        await player1Promise;
        return { id: 1, token: "tok1", image: "img1.png" };
      }
      return { id: 2, token: "tok2", image: "img2.png" };
    });

    render(
      <MemoryRouter>
        <NewGameProvider>
          <NewGameForm />
        </NewGameProvider>
      </MemoryRouter>,
    );

    // Select 2 players
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    const usernameInputs = screen.getAllByLabelText("username");
    const passwordInputs = screen.getAllByLabelText("password");

    // Enter Player 1 details and blur password to trigger login
    fireEvent.change(usernameInputs[0], { target: { value: "Player1" } });
    fireEvent.change(passwordInputs[0], { target: { value: "pass1" } });
    fireEvent.blur(passwordInputs[0]);

    // Player 1 login is now in flight. Type in Player 2's username input
    fireEvent.change(usernameInputs[1], { target: { value: "Player2Typed" } });
    expect(usernameInputs[1]).toHaveValue("Player2Typed");

    // Now resolve Player 1's login
    resolvePlayer1Login(undefined);

    // Wait for Player 1 to be logged in
    await waitFor(() => {
      expect(usernameInputs[0]).toBeDisabled();
    });

    // Verify Player 2 username did NOT reset
    expect(usernameInputs[1]).toHaveValue("Player2Typed");
  });
});

