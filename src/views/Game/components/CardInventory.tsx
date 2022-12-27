import { Card, Stack, Typography } from "@mui/material";
import { FunctionComponent } from "react";
import useGame from "../../../stores/game";

interface CardInventoryProps {}

const CardInventory: FunctionComponent<CardInventoryProps> = () => {
    const { cards, playersCount } = useGame((state) => ({
        cards: state.cards,
        playersCount: state.playerCount,
    }));

    const cardsLeftOfValue = (value: number) => {
        return playersCount - cards.filter((card) => card.value === value).length;
    };

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                justifyContent: "center",
            }}
        >
            {new Array(13).fill(0).map((_, i) => {
                const empty = cardsLeftOfValue(i + 2) === 0;

                return (
                    <Card
                        variant="outlined"
                        key={i}
                        sx={{
                            width: 78,
                            textAlign: "center",

                            ...(empty && {
                                opacity: 0.75,
                                background: (t) => t.palette.mode === "dark" ? "url('/whiteheart.svg')" : "url('/blackheart.svg')",
                                backgroundSize: "36px",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                            }),
                        }}
                    >
                        {!empty && (
                            <>
                                <Typography
                                    fontSize={14}
                                    fontWeight={800}
                                    textAlign="left"
                                    paddingLeft="8px"
                                    paddingTop="8px"
                                >
                                    {valueToSymbol(i + 2)}
                                </Typography>

                                <Typography fontSize={32}>{cardsLeftOfValue(i + 2)}</Typography>

                                <Typography
                                    fontSize={14}
                                    fontWeight={800}
                                    textAlign="left"
                                    paddingLeft="8px"
                                    paddingTop="8px"
                                    sx={{
                                        transform: "rotate(180deg)",
                                        color: "primary.main",
                                    }}
                                >
                                    {valueToSymbol(i + 2)}
                                </Typography>
                            </>
                        )}
                    </Card>
                );
            })}
        </Stack>
    );
};

const valueToSymbol = (value: number) => {
    switch (value) {
        case 11:
            return "J";
        case 12:
            return "Q";
        case 13:
            return "K";
        case 14:
            return "A";
        default:
            return value;
    }
};

export default CardInventory;
