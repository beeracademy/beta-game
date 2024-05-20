import create from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

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
  themeMode: "light",

  simpleCardsMode: false,

  remoteControl: false,
  remoteToken: "",

  lobbyMusicMuted: false,
};

const useSettings = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,

      SetSimpleCardsMode: (value: boolean) => {
        set((state) => ({ simpleCardsMode: value }));
      },

      SetRemoteControl: (value: boolean) => {
        set((state) => ({
          remoteControl: value,
          remoteToken: value ? window.crypto.randomUUID() : undefined,
        }));
      },

      SetThemeMode: (value: ThemeMode) => {
        set((state) => ({ themeMode: value }));
      },

      SetLobbyMusicMuted: (value: boolean) => {
        set((state) => ({ lobbyMusicMuted: value }));
      },
    }),
    {
      name: "settings",
    },
  ),
);

export default useSettings;
export type { SettingsActions, SettingsState, ThemeMode };
