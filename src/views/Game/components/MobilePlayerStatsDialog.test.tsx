import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../stores/game";
import { SharedControlProvider } from "../../../stores/sharedControl";
import MobilePlayerStatsDialog from "./MobilePlayerStatsDialog";

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

vi.mock("../../../stores/metrics", () => ({
  usePlayerMetricsByIndex: () => ({
    totalSips: 10,
    maxSips: 5,
    minSips: 1,
    totalTime: 120,
    numberOfBeers: 1,
    numberOfChugs: 0,
  }),
}));

describe("MobilePlayerStatsDialog", () => {
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

  it("calls SetPlayerDNF on host when clicking DNF button", () => {
    const setPlayerDNFSpy = vi.spyOn(useGame.getState(), "SetPlayerDNF");

    render(<MobilePlayerStatsDialog open={true} index={0} onClose={vi.fn()} />);

    const dnfBtn = screen.getByRole("button", { name: /did not finish/i });
    fireEvent.click(dnfBtn);

    expect(setPlayerDNFSpy).toHaveBeenCalledWith(0, true);
  });

  it("sends GET_DNF_STATE on open when in remote mode", () => {
    const sendMock = vi.fn();

    render(
      <SharedControlProvider send={sendMock}>
        <MobilePlayerStatsDialog open={true} index={0} onClose={vi.fn()} />
      </SharedControlProvider>,
    );

    expect(sendMock).toHaveBeenCalledWith({ event: "GET_DNF_STATE" });
  });

  it("sends SET_PLAYER_DNF in remote mode when clicking DNF button", () => {
    const sendMock = vi.fn();
    const setPlayerDNFSpy = vi.spyOn(useGame.getState(), "SetPlayerDNF");

    render(
      <SharedControlProvider send={sendMock}>
        <MobilePlayerStatsDialog open={true} index={1} onClose={vi.fn()} />
      </SharedControlProvider>,
    );

    const dnfBtn = screen.getByRole("button", { name: /did not finish/i });
    fireEvent.click(dnfBtn);

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
