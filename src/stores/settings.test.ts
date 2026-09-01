import { beforeEach, describe, expect, it } from "vitest";
import useSettings, { getNextThemeMode } from "./settings";

describe("settings store - themeMode", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettings.setState({
      themeMode: "system",
      simpleCardsMode: true,
      remoteControl: false,
      remoteToken: "",
      lobbyMusicMuted: false,
    });
  });

  it("should default to system themeMode", () => {
    expect(useSettings.getState().themeMode).toBe("system");
  });

  it("should update themeMode when SetThemeMode is called", () => {
    const { SetThemeMode } = useSettings.getState();

    SetThemeMode("dark");
    expect(useSettings.getState().themeMode).toBe("dark");

    SetThemeMode("light");
    expect(useSettings.getState().themeMode).toBe("light");

    SetThemeMode("system");
    expect(useSettings.getState().themeMode).toBe("system");
  });

  it("should cycle correctly with getNextThemeMode", () => {
    expect(getNextThemeMode("system")).toBe("dark");
    expect(getNextThemeMode("dark")).toBe("light");
    expect(getNextThemeMode("light")).toBe("system");
  });

  it("should persist choice to localStorage", () => {
    const { SetThemeMode } = useSettings.getState();
    SetThemeMode("dark");

    const raw = localStorage.getItem("settings");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.themeMode).toBe("dark");
    expect(parsed.version).toBe(1);
  });
});
