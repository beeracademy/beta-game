import { getServerInfo } from "../api/endpoints/time";

export const secondsToHHMMSS = (milliseconds: number): string => {
  const safeMs = Math.max(0, Math.floor(milliseconds || 0));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

export const secondsToHHMMSSsss = (milliseconds: number): string => {
  const safeMs = Math.max(0, Math.floor(milliseconds || 0));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const remMs = safeMs % 1000;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  const msStr = remMs.toString().padStart(3, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}.${msStr}`;
};

export const millisecondsToMMSSsss = (milliseconds: number): string => {
  const safeMs = Math.max(0, Math.floor(milliseconds || 0));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const remMs = safeMs % 1000;

  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  const msStr = remMs.toString().padStart(3, "0");

  return `${minutesStr}:${secondsStr}.${msStr}`;
};

export const datetimeToddmmHHMMSS = (datetime: string): string => {
  const date = new Date(datetime);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const maxDiffAllowedMiliseconds = 10 * 1000; // 10 seconds

export const isLocalTimeSynchronized = async (): Promise<[boolean, number]> => {
  const info = await getServerInfo();
  const diff = Date.now() - new Date(info.datetime).getTime();
  const absDiff = Math.abs(diff);

  let isSynchronized = absDiff < maxDiffAllowedMiliseconds;

  return [isSynchronized, diff];
};
