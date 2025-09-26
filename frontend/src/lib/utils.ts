import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthUrl(
  provider: string,
  options:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined = {}
): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const baseUrl = `${apiUrl}/auth/${provider}`;
  const queryParams = new URLSearchParams(options).toString();
  return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
}

export const numToHip = (num: number, toFixed: number = 2) => {
  // for like k, m, b
  if (num >= 1e9) return (num / 1e9).toFixed(toFixed) + "b";
  if (num >= 1e6) return (num / 1e6).toFixed(toFixed) + "m";
  if (num >= 1e3) return (num / 1e3).toFixed(toFixed) + "k";
  return num.toFixed(toFixed).toString();
};

export function generatePath(
  path: string,
  params: Record<string, string | number>
) {
  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(`:${key}`, encodeURIComponent(String(params[key])));
  }, path);
}

export function getBaseUrl() {
  if (typeof window === "undefined") {
    // Server-side (SSR)
    return process.env.SSR_API_URL || process.env.NEXT_PUBLIC_API_URL;
  }
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL;
}
