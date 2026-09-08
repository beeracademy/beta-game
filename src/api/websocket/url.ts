export const getWsBaseUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    return apiBase.replace(/^http/, "ws").replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}`;
  }
  return "ws://localhost:8000";
};
