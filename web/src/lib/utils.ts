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

// Deterministic hand-drawn mascot avatar per name — same generator DiceBear's
// "notionists" style is designed to echo (Notion's own persona illustrations).
// Seeded by name so it's stable across renders without storing anything.
export function avatarUrlForName(name: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;
}

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "5 minutes ago" / "Yesterday, 4:10 pm" / full date-time — used by the activity timelines. */
export function formatRelativeTime(iso: string) {
  const now = new Date();
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) {
    const m = Math.floor(diff / (60 * 1000));
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const h = Math.floor(diff / (60 * 60 * 1000));
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    const time = date.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" });
    return `Yesterday, ${time}`;
  }
  return formatDateTime(iso);
}

/** Compact "5m ago" / "3h ago" / "12d ago" / "4 Jun" — used by the forum. */
export function formatTimeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
