import { DialogProps } from "@mui/material";
import { FunctionComponent } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";

interface ExitGameDialogProps extends DialogProps {}
 
const ExitGameDialog: FunctionComponent<ExitGameDialogProps> = (props) => {
    return (
        <ConfirmDialog 
            {...props}
            title="Exit game"
            message="Are you sure you want to exit the game?"
            onCancel={() => props.onClose?.({
                ok: false,
            }, "backdropClick")}
            onConfirm={() => props.onClose?.({
                ok: true,
            }, "backdropClick")}            
        />
    );
}
 
export default ExitGameDialog;