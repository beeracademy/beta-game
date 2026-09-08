import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useGame, { createInitialGameState } from "../../../stores/game";
import RetryUploadDialog from "./RetryUploadDialog";

describe("RetryUploadDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    useGame.setState({
      ...createInitialGameState(),
      players: [
        { id: 1, username: "Alice", token: "tok1" },
        { id: 2, username: "Bob", token: "tok2" },
      ],
      offline: false,
      submitted: false,
      token: "game-token-123",
      id: 999,
      gameStartDateString: "2026-09-02T12:00:00Z",
      shuffleIndices: [1, 2, 3],
    });
  });

  it("retries the upload and reports success", async () => {
    const submitSpy = vi.fn().mockResolvedValue(undefined);
    useGame.setState({ Submit: submitSpy });

    const onUploaded = vi.fn();

    render(
      <RetryUploadDialog
        open={true}
        description="Nice game"
        onUploaded={onUploaded}
        onDismiss={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry upload now/i }));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({ description: "Nice game" });
      expect(onUploaded).toHaveBeenCalled();
    });
  });

  it("keeps the dialog open when the retry fails", async () => {
    const submitSpy = vi.fn().mockRejectedValue(new Error("offline"));
    useGame.setState({ Submit: submitSpy });

    const onUploaded = vi.fn();

    render(
      <RetryUploadDialog
        open={true}
        onUploaded={onUploaded}
        onDismiss={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry upload now/i }));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalled();
    });

    expect(onUploaded).not.toHaveBeenCalled();
    expect(screen.getByText(/failed to upload game/i)).toBeInTheDocument();
  });

  it("downloads the game as a json file", async () => {
    const clickSpy = vi.fn();
    const createElement = document.createElement.bind(document);
    let downloadAnchor: HTMLAnchorElement | undefined;

    vi.spyOn(document, "createElement").mockImplementation((tagName, opts) => {
      const element = createElement(tagName, opts);
      if (tagName === "a") {
        downloadAnchor = element as HTMLAnchorElement;
        element.addEventListener("click", clickSpy);
      }
      return element;
    });

    render(
      <RetryUploadDialog
        open={true}
        description="Nice game"
        onUploaded={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /download game file/i }),
    );

    expect(clickSpy).toHaveBeenCalled();
    expect(downloadAnchor?.getAttribute("download")).toBe("game_999.json");

    const href = downloadAnchor?.getAttribute("href") as string;
    const json = JSON.parse(
      decodeURIComponent(href.replace("data:text/json;charset=utf-8,", "")),
    );

    expect(json).toMatchObject({
      id: 999,
      token: "game-token-123",
      start_datetime: "2026-09-02T12:00:00Z",
      player_names: ["Alice", "Bob"],
      player_ids: [1, 2],
      official: true,
      shuffle_indices: [1, 2, 3],
      has_ended: true,
      description: "Nice game",
    });

    await screen.findByText(/failed to upload game/i);

    vi.mocked(document.createElement).mockRestore();
  });

  it("dismisses on request", () => {
    const onDismiss = vi.fn();

    render(
      <RetryUploadDialog
        open={true}
        onUploaded={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(onDismiss).toHaveBeenCalled();
  });
});
