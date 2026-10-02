import type { FunctionComponent } from "react";
import type { Game } from "../../../../api/models/game";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import FormattedTime from "../../../../components/FormattedTime";
import { datetimeToddmmHHMMSS } from "../../../../utilities/time";

interface ContinueGameDialogProps {
  open: boolean;
  game: Game;
  onConfirm: () => void;
  onCancel: () => void;
}

const ContinueGameDialog: FunctionComponent<ContinueGameDialogProps> = ({
  open,
  game,
  onConfirm,
  onCancel,
}) => {
  const playerNames =
    (game as any).players && Array.isArray((game as any).players)
      ? (game as any).players.map((p: any) => p.username)
      : game.player_names || [];

  return (
    <ConfirmDialog
      open={open}
      title="Resume a game"
      message={
        <>
          Are you sure you want to resume game {game.id} started at{" "}
          <FormattedTime value={datetimeToddmmHHMMSS(game.start_datetime)} />{" "}
          with {playerNames.join(", ")}?
        </>
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
};

export default ContinueGameDialog;
