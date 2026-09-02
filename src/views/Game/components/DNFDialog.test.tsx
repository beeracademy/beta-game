import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import { SharedControlProvider } from "../../../stores/sharedControl";
import DNFDialog from "./DNFDialog";

vi.mock("../../../hooks/sounds", () => ({
  useSounds: () => ({
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
  }),
}));

describe("DNFDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGame.setState({
      players: [
        { id: 101, username: "Alice", token: "tok1" },
        { id: 102, username: "Bob", token: "tok2" },
      ],
      dnf_player_indexes: [],
    });
  });

  it("calls SetPlayerDNF on host when clicking a player", () => {
    const setPlayerDNFSpy = vi.spyOn(useGame.getState(), "SetPlayerDNF");

    render(<DNFDialog open={true} onClose={vi.fn()} />);

    const aliceBtn = screen.getByText("Alice");
    fireEvent.click(aliceBtn);

    expect(setPlayerDNFSpy).toHaveBeenCalledWith(0, true);
  });

  it("sends GET_DNF_STATE on open when in remote mode", () => {
    const sendMock = vi.fn();

    render(
      <SharedControlProvider send={sendMock}>
        <DNFDialog open={true} onClose={vi.fn()} />
      </SharedControlProvider>,
    );

    expect(sendMock).toHaveBeenCalledWith({ event: "GET_DNF_STATE" });
  });

  it("sends SET_PLAYER_DNF when player is clicked in remote mode without calling local SetPlayerDNF", () => {
    const sendMock = vi.fn();
    const setPlayerDNFSpy = vi.spyOn(useGame.getState(), "SetPlayerDNF");

    render(
      <SharedControlProvider send={sendMock}>
        <DNFDialog open={true} onClose={vi.fn()} />
      </SharedControlProvider>,
    );

    const bobBtn = screen.getByText("Bob");
    fireEvent.click(bobBtn);

    expect(sendMock).toHaveBeenCalledWith({
      event: "SET_PLAYER_DNF",
      payload: {
        playerIndex: 1,
        playerId: 102,
        dnf: true,
      },
    });
    expect(setPlayerDNFSpy).not.toHaveBeenCalled();
  });
});
