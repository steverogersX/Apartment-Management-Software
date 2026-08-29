"use client";

import * as React from "react";
import { Bell, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CATEGORY_ICON,
  initialNotifications,
  type NotificationRecord,
} from "@/lib/notificationsMockData";

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsMenu() {
  const [notifications, setNotifications] =
    React.useState<NotificationRecord[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function markAsRead(id: string) {
    setNotifications((rows) => rows.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function markAllAsRead() {
    setNotifications((rows) => rows.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" className="relative" />}>
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Check className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications.</p>
        ) : (
          <div className="flex max-h-80 flex-col overflow-y-auto">
            {notifications.map((n) => {
              const Icon = CATEGORY_ICON[n.category];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "flex items-start gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted/50",
                    !n.isRead && "bg-accent/50",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-foreground"
                          aria-hidden
                        />
                      )}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {n.description}
                    </span>
                    <span className="text-[11px] text-muted-foreground/70">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
