import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deterministic gradients for avatars without an uploaded photo/logo —
// the same name always maps to the same gradient (Slack/Notion-style defaults).
const AVATAR_PALETTE: [string, string][] = [
  ["#f43f5e", "#fb923c"],
  ["#8b5cf6", "#d946ef"],
  ["#3b82f6", "#22d3ee"],
  ["#10b981", "#2dd4bf"],
  ["#6366f1", "#38bdf8"],
  ["#ec4899", "#fb7185"],
  ["#f59e0b", "#facc15"],
  ["#22c55e", "#a3e635"],
];

export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function gradientForName(name: string) {
  return AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
}

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
