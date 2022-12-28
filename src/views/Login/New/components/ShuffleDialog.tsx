import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Stack } from "@mui/material";
import { FunctionComponent } from "react";

interface ShuffleDialogProps extends DialogProps {}

const ShuffleDialog: FunctionComponent<ShuffleDialogProps> = (props) => {
    return (
        <Dialog
            {...props}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    padding: 2,
                },
            }}
        >
            <DialogTitle textAlign="center" fontSize={24}>
                Shuffle player order before starting?
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: 4,
                }}
            >
                <Stack spacing={2} direction="row" justifyContent="center">
                    {new Array(6).fill(0).map((_, i) => (
                        <Avatar
                            src={
                                Math.random() > 0.5
                                    ? "https://thiscatdoesnotexist.com/"
                                    : "https://thispersondoesnotexist.com/image"
                            }
                            key={i}
                            sx={{
                                width: 100,
                                height: 100,
                            }}
                        />
                    ))}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: "center",
                }}
            >
                <Button variant="contained" color="primary" size="large">
                    Shuffle em!
                </Button>
                <Button variant="outlined" color="primary" size="large">
                    Keep order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShuffleDialog;
