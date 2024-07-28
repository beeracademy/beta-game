import { getServerInfo } from "../api/endpoints/time";

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

const maxDiffAllowedMiliseconds = 10 * 1000; // 10 seconds

export const isLocalTimeSynchronized = async (): Promise<[boolean, number]> => {
  const info = await getServerInfo();
  const diff = Date.now() - new Date(info.datetime).getTime();
  const absDiff = Math.abs(diff);

  let isSynchronized = absDiff < maxDiffAllowedMiliseconds;

  return [isSynchronized, diff];
};
