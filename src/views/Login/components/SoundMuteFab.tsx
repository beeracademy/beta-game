import { Fab } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { MdMusicNote, MdMusicOff } from "react-icons/md";
import { SoundName, useSounds } from "../../../hooks/sounds";
import useSettings from "../../../stores/settings";

const lobbyMusic: SoundName = "homosangen_fuve";

interface SoundMuteFabProps {
  absolutePosition?: boolean;
}

const SoundMuteFab: FunctionComponent<SoundMuteFabProps> = ({
  absolutePosition = true,
}) => {
  const { lobbyMusicMuted, SetLobbyMusicMuted } = useSettings();
  const { mute, unmute, play, stop } = useSounds();

  useEffect(() => {
    play(lobbyMusic, {
      loop: true,
      oneInstance: true,
    });

    return () => {
      stop(lobbyMusic);
    };
  }, []);

  useEffect(() => {
    if (lobbyMusicMuted) {
      mute(lobbyMusic);
    } else {
      unmute(lobbyMusic);
    }
  }, [lobbyMusicMuted]);

  return (
    <Fab
      color="primary"
      aria-label={lobbyMusicMuted ? "Unmute music" : "Mute music"}
      sx={{
        position: absolutePosition ? "absolute" : undefined,
        bottom: absolutePosition ? 16 : undefined,
        right: absolutePosition ? 16 : undefined,
      }}
      onClick={() => {
        SetLobbyMusicMuted(!lobbyMusicMuted);
      }}
    >
      {lobbyMusicMuted ? <MdMusicOff size={28} /> : <MdMusicNote size={28} />}
    </Fab>
  );
};

export default SoundMuteFab;
