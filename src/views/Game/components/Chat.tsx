import { Box, Card, CardContent, CardHeader, TextField } from "@mui/material";
import { FunctionComponent } from "react";

interface ChatProps {}

const Chat: FunctionComponent<ChatProps> = () => {
    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                width: 300,
                resize: "horizontal",
                minWidth: 200,
                maxWidth: 600,
            }}
        >
            <CardHeader
                title="Chat"
                sx={{
                    textAlign: "center",
                }}
            />

            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: 1,
                    "&:last-child": {
                        paddingBottom: 1,
                    },
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                    }}
                >
                    Messages
                </Box>

                <TextField fullWidth />
            </CardContent>
        </Card>
    );
};

export default Chat;
