import { useEffect } from "react";
import { SoundName, useSounds } from "../../../hooks/sounds";
import useSettings from "../../../stores/settings";

const lobbyMusic: SoundName = "homosangen_fuve";

const useLobbyMusic = () => {
  const { lobbyMusicMuted } = useSettings();
  const { mute, unmute, play, stop } = useSounds();

  useEffect(() => {
    play(lobbyMusic, {
      loop: true,
      oneInstance: true,
    });

    return () => {
      stop(lobbyMusic);
    };
  }, [play, stop]);

  useEffect(() => {
    if (lobbyMusicMuted) {
      mute(lobbyMusic);
    } else {
      unmute(lobbyMusic);
    }
  }, [lobbyMusicMuted, mute, unmute]);
};

export default useLobbyMusic;
