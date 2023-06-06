import { Fab, useTheme } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";

interface SoundMuteFabProps {
  absolutePosition?: boolean;
}

const SoundMuteFab: FunctionComponent<SoundMuteFabProps> = (props) => {
  const theme = useTheme();
  const [muted, setMuted] = useState(false);

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
        setMuted(!muted);
        Howler.mute(!muted);
      }}
    >
      {muted ? <IoVolumeMute size={32} /> : <IoVolumeHigh size={32} />}
    </Fab>
  );
};

SoundMuteFab.defaultProps = {
  absolutePosition: true,
};

export default SoundMuteFab;
