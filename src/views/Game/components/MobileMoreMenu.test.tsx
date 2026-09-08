import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileMoreMenu } from "./MobileMoreMenu";

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

describe("MobileMoreMenu", () => {
  const dummyAnchor = document.createElement("div");

  const defaultProps = {
    anchorEl: dummyAnchor,
    onClose: vi.fn(),
    onOpenChugs: vi.fn(),
    onOpenSharedControl: vi.fn(),
    onOpenChat: vi.fn(),
    onExitGame: vi.fn(),
    isRemote: false,
    isGameDone: false,
    isOffline: false,
    themeMode: "system" as const,
    onSetThemeMode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders shared control button when online and host", () => {
    render(<MobileMoreMenu {...defaultProps} isOffline={false} isRemote={false} />);

    expect(
      screen.getByRole("button", { name: /shared control/i }),
    ).toBeInTheDocument();
  });

  it("does not render shared control button when offline", () => {
    render(<MobileMoreMenu {...defaultProps} isOffline={true} isRemote={false} />);

    expect(
      screen.queryByRole("button", { name: /shared control/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render shared control button when remote client", () => {
    render(<MobileMoreMenu {...defaultProps} isOffline={false} isRemote={true} />);

    expect(
      screen.queryByRole("button", { name: /shared control/i }),
    ).not.toBeInTheDocument();
  });
});
