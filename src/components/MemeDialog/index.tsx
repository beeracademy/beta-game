import { Dialog } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { GetRandomMemeByTag } from "../../utilities/memes";

interface MemeDialogProps {
    open: boolean;
    tag?: string;
}
 
const MemeDialog: FunctionComponent<MemeDialogProps> = (props) => {
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        (async () => {
            let paramTag = props.tag;
            if (!paramTag) {
                paramTag = getRandomTag();
            }

            const memeURL = await GetRandomMemeByTag(paramTag);
            setUrl(memeURL);
        })();
    }, []);

    return (
        <Dialog open={props.open}>
            <img src={url} width={500}/>
        </Dialog>
    );
}

const randomTags = [
    "drinking",
    "drunk",
    "beer",
    "puke",
    "shrek",
    "chug beer",
];

const getRandomTag = () => {
    return randomTags[Math.floor(Math.random() * randomTags.length)];
};
    
export default MemeDialog