import { DialogProps } from "@mui/material";
import { FunctionComponent } from "react";
import { Game } from "../../../../api/models/game";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { datetimeToddmmHHMMSS } from "../../../../utilities/time";

interface ContinueGameDialogProps extends DialogProps {
  game: Game;
}

const ContinueGameDialog: FunctionComponent<ContinueGameDialogProps> = (
  props,
) => {
  return (
    <ConfirmDialog
      {...props}
      title="Continue a game"
      message={`Are you sure you want to continue game ${
        props.game.id
      } started at ${datetimeToddmmHHMMSS(
        props.game.start_datetime,
      )} with ${props.game.player_names.join(", ")}?`}
      onCancel={() =>
        props.onClose?.(
          {
            ok: false,
          },
          "backdropClick",
        )
      }
      onConfirm={() =>
        props.onClose?.(
          {
            ok: true,
          },
          "backdropClick",
        )
      }
    />
  );
};

export default ContinueGameDialog;
