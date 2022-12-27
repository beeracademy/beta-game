import create from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface SettingsState {
    simpleCardsMode: boolean;
    remoteControl: boolean;
    themeMode: ThemeMode;
}

interface SettingsActions {
    SetSimpleCardsMode: (value: boolean) => void;
    SetRemoteControl: (value: boolean) => void;
    SetThemeMode: (value: ThemeMode) => void;
}

const initialState: SettingsState = {
    simpleCardsMode: false,
    remoteControl: false,
    themeMode: "light",
};    

const useSettings = create<SettingsState & SettingsActions>()(
    persist(
        (set) => ({
            ...initialState,

            SetSimpleCardsMode: (value: boolean) => {
                set((state) => ({ simpleCardsMode: value }));
            },

            SetRemoteControl: (value: boolean) => {
                set((state) => ({ remoteControl: value }));
            },

            SetThemeMode: (value: ThemeMode) => {
                set((state) => ({ themeMode: value }));
            }
        }),
        {
            name: "settings",
        },
    ),
);

export default useSettings;
export type { SettingsState, SettingsActions, ThemeMode };