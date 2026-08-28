export type SessionRecord = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  current: boolean;
  lastActiveAt: string;
  createdAt: string;
};

export const sessions: SessionRecord[] = [
  {
    id: "sess-1",
    device: "Windows · Chrome",
    browser: "Chrome 124",
    location: "Bengaluru, IN",
    ipAddress: "49.207.12.4",
    current: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: "2026-06-10T08:30:00.000Z",
  },
  {
    id: "sess-2",
    device: "iPhone · Safari",
    browser: "Safari 17",
    location: "Bengaluru, IN",
    ipAddress: "49.207.12.91",
    current: false,
    lastActiveAt: "2026-06-17T19:42:00.000Z",
    createdAt: "2026-06-01T07:05:00.000Z",
  },
  {
    id: "sess-3",
    device: "MacOS · Chrome",
    browser: "Chrome 123",
    location: "Mumbai, IN",
    ipAddress: "103.21.244.18",
    current: false,
    lastActiveAt: "2026-06-12T11:15:00.000Z",
    createdAt: "2026-05-22T14:00:00.000Z",
  },
];
