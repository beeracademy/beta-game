export const secondsToHHMMSS = (seconds: number): string => {
    return new Date(seconds).toISOString().slice(11, 19);
};

export const milisecondsToMMSSsss = (miliseconds: number): string => {
    return new Date(miliseconds).toISOString().slice(14, 23);
}