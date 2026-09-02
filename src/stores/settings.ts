import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "system" | "light" | "dark";

export const getNextThemeMode = (current: ThemeMode): ThemeMode => {
  switch (current) {
    case "system":
      return "dark";
    case "dark":
      return "light";
    case "light":
      return "system";
  }
};

interface SettingsState {
  themeMode: ThemeMode;

  simpleCardsMode: boolean;

  remoteControl: boolean;
  remoteToken?: string;

  lobbyMusicMuted: boolean;
}

interface SettingsActions {
  SetSimpleCardsMode: (value: boolean) => void;
  SetRemoteControl: (value: boolean) => void;
  SetThemeMode: (value: ThemeMode) => void;
  SetLobbyMusicMuted: (value: boolean) => void;
}

const initialState: SettingsState = {
  themeMode: "system",

  simpleCardsMode: true,

  remoteControl: false,
  remoteToken: "",

  lobbyMusicMuted: false,
};

const useSettings = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,

      SetSimpleCardsMode: (value: boolean) => {
        set({ simpleCardsMode: value });
      },

      SetRemoteControl: (value: boolean) => {
        set({
          remoteControl: value,
          remoteToken: value ? window.crypto.randomUUID() : undefined,
        });
      },

      SetThemeMode: (value: ThemeMode) => {
        set({ themeMode: value });
      },

      SetLobbyMusicMuted: (value: boolean) => {
        set({ lobbyMusicMuted: value });
      },
    }),
    {
      name: "settings",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            themeMode: "system",
          };
        }
        return persistedState;
      },
    },
  ),
);

export default useSettings;
export type { SettingsActions, SettingsState, ThemeMode };
