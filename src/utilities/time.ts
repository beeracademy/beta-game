export const secondsToHHMMSS = (seconds: number): string => {
    return new Date(seconds).toISOString().slice(11, 19);
};

export const secondsToHHMMSSsss = (seconds: number): string => {
    return new Date(seconds).toISOString().slice(11, 23);
};

export const milisecondsToMMSSsss = (miliseconds: number): string => {
    return new Date(miliseconds).toISOString().slice(14, 23);
};

export const datetimeToddmmHHMMSS = (datetime: string): string => {
    const date = new Date(datetime);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
