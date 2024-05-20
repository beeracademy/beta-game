import { Fab, useTheme } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { SoundName, useSounds } from "../../../hooks/sounds";
import useSettings from "../../../stores/settings";

const lobbyMusic: SoundName = "homosangen_fuve";

interface SoundMuteFabProps {
  absolutePosition?: boolean;
}

const SoundMuteFab: FunctionComponent<SoundMuteFabProps> = ({
  absolutePosition = true,
}) => {
  const theme = useTheme();

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
      sx={{
        position: absolutePosition ? "absolute" : undefined,
        bottom: absolutePosition ? 16 : undefined,
        right: absolutePosition ? 16 : undefined,

        [theme.breakpoints.down("md")]: {
          display: "none",
        },
      }}
      onClick={() => {
        SetLobbyMusicMuted(!lobbyMusicMuted);
        Howler.mute(!lobbyMusicMuted);
      }}
    >
      {lobbyMusicMuted ? (
        <IoVolumeMute size={32} />
      ) : (
        <IoVolumeHigh size={32} />
      )}
    </Fab>
  );
};

export default SoundMuteFab;
