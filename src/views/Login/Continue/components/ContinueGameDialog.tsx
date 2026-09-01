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
  const playerNames =
    (props.game as any).players && Array.isArray((props.game as any).players)
      ? (props.game as any).players.map((p: any) => p.username)
      : props.game.player_names || [];

  return (
    <ConfirmDialog
      {...props}
      title="Continue a game"
      message={`Are you sure you want to continue game ${
        props.game.id
      } started at ${datetimeToddmmHHMMSS(
        props.game.start_datetime,
      )} with ${playerNames.join(", ")}?`}
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
