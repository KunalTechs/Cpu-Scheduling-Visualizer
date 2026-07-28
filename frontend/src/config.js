const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname || "localhost";
  const port = window.location.port === "3000" ? "8081" : "8080";
  return `${window.location.protocol}//${hostname}:${port}`;
};

export const API_BASE = getApiBase();