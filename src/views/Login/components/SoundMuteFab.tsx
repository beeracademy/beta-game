import { Fab, useTheme } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { SoundName, useSounds } from "../../../hooks/sounds";
import useSettings from "../../../stores/settings";

const lobbyMusic: SoundName = "homosangen_fuve";

interface SoundMuteFabProps {
  absolutePosition?: boolean;
}

const SoundMuteFab: FunctionComponent<SoundMuteFabProps> = (props) => {
  const theme = useTheme();

  const { lobbyMusicMuted, SetLobbyMusicMuted } = useSettings();
  const { mute, unmute, play } = useSounds();

  useEffect(() => {
    play(lobbyMusic, {
      loop: true,
      oneInstance: true,
    });
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
        position: props.absolutePosition ? "absolute" : undefined,
        bottom: props.absolutePosition ? 16 : undefined,
        right: props.absolutePosition ? 16 : undefined,

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

SoundMuteFab.defaultProps = {
  absolutePosition: true,
};

export default SoundMuteFab;
