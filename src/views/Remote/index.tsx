import { Button, Container } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { useSearchParam } from "react-use";
import useWebSocket from "../../api/websocket";
import useGame from "../../stores/game";
import GameTable from "../Game/components/Table";

interface RemoteViewProps {}

const RemoteView: FunctionComponent<RemoteViewProps> = () => {
    const token = useSearchParam("token");
    const game = useGame((state) => state);

    const [wsinst, setWsinst] = useState<any>(null);
        
    useEffect(() => {
        const ws = useWebSocket(`wss://academy.beer/ws/remote/${token}/`);

        ws.receive((message) => {
            useGame.setState(message);
        });

        setWsinst(ws);
    }, []);

    return (
        <Container
            sx={{
                backgroundColor: "background.paper",
            }}
        >
            <GameTable />
            <Button
                onClick={() => {
                    wsinst.send({
                        type: "draw",
                    });
                }}
            >
                Draw
            </Button>
        </Container>
    );
};

export default RemoteView;
