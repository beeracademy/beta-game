import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { IoClose } from "react-icons/io5";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <IconButton
        aria-label="Close"
        onClick={onCancel}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <IoClose size={20} />
      </IconButton>

      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ textAlign: "center" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          size="large"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
export type { ConfirmDialogProps };
