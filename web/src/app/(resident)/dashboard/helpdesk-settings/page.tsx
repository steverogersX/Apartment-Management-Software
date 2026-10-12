"use client";

import * as React from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { complaints } from "@/lib/mockData";
import {
  helpdeskCategories as initialCategories,
  helpdeskNotificationSettings as initialNotifications,
  slaRules as initialSlaRules,
} from "@/lib/helpdeskSettingsMockData";
import type {
  HelpdeskCategory,
  HelpdeskNotificationSettings,
  SlaRule,
} from "@/lib/helpdeskSettingsMockData";
import { PermissionDenied } from "@/components/permissionDenied";

export default function HelpdeskSettingsPage() {
  const { has } = useAuth();

  if (!has("SocietySettingsUpdate")) {
    return <PermissionDenied message="You do not have permission to manage helpdesk settings." />;
  }

  // Categories section
  const [categories, setCategories] = React.useState<HelpdeskCategory[]>(() => [
    ...initialCategories,
  ]);
  const [savedCategories, setSavedCategories] = React.useState<HelpdeskCategory[]>(() => [
    ...initialCategories,
  ]);
  const [newCategory, setNewCategory] = React.useState("");
  const [savingCategories, setSavingCategories] = React.useState(false);
  const [savedCategoriesFlag, setSavedCategoriesFlag] = React.useState(false);

  const categoriesDirty = React.useMemo(
    () => JSON.stringify(categories) !== JSON.stringify(savedCategories),
    [categories, savedCategories],
  );

  function handleAddCategory() {
    const name = newCategory.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const newCat: HelpdeskCategory = { id: `cat-${Date.now()}`, name };
    setCategories((prev) => [...prev, newCat]);
    setNewCategory("");
  }

  function handleRemoveCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSaveCategories() {
    setSavingCategories(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Mutate in-memory source of truth
    initialCategories.length = 0;
    categories.forEach((c) => initialCategories.push(c));
    setSavedCategories([...categories]);
    setSavingCategories(false);
    setSavedCategoriesFlag(true);
    setTimeout(() => setSavedCategoriesFlag(false), 2000);
  }

  // SLA section
  const [sla, setSla] = React.useState<SlaRule[]>(() => initialSlaRules.map((r) => ({ ...r })));
  const [savedSla, setSavedSla] = React.useState<SlaRule[]>(() =>
    initialSlaRules.map((r) => ({ ...r })),
  );
  const [savingSla, setSavingSla] = React.useState(false);
  const [savedSlaFlag, setSavedSlaFlag] = React.useState(false);

  const slaDirty = React.useMemo(
    () => JSON.stringify(sla) !== JSON.stringify(savedSla),
    [sla, savedSla],
  );

  function updateSla(priority: SlaRule["priority"], patch: Partial<SlaRule>) {
    setSla((prev) => prev.map((r) => (r.priority === priority ? { ...r, ...patch } : r)));
  }

  async function handleSaveSla() {
    setSavingSla(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    initialSlaRules.length = 0;
    sla.forEach((r) => initialSlaRules.push({ ...r }));
    setSavedSla(sla.map((r) => ({ ...r })));
    setSavingSla(false);
    setSavedSlaFlag(true);
    setTimeout(() => setSavedSlaFlag(false), 2000);
  }

  // Notifications section
  const [notifications, setNotifications] = React.useState<HelpdeskNotificationSettings>({
    ...initialNotifications,
  });
  const [savedNotifications, setSavedNotifications] = React.useState<HelpdeskNotificationSettings>({
    ...initialNotifications,
  });
  const [savingNotifications, setSavingNotifications] = React.useState(false);
  const [savedNotificationsFlag, setSavedNotificationsFlag] = React.useState(false);

  const notificationsDirty = React.useMemo(
    () => JSON.stringify(notifications) !== JSON.stringify(savedNotifications),
    [notifications, savedNotifications],
  );

  async function handleSaveNotifications() {
    setSavingNotifications(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    Object.assign(initialNotifications, notifications);
    setSavedNotifications({ ...notifications });
    setSavingNotifications(false);
    setSavedNotificationsFlag(true);
    setTimeout(() => setSavedNotificationsFlag(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Helpdesk Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage categories, SLA rules, and notifications for complaints.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage the categories residents can choose when raising a complaint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const usageCount = complaints.filter((c) => c.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{cat.name}</span>
                    {usageCount > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {usageCount} complaint{usageCount === 1 ? "" : "s"} use this category
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveCategory(cat.id)}
                    aria-label={`Remove ${cat.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="new-category">Add category</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Landscaping"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedCategoriesFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved
                </span>
              )}
            </div>
            <Button
              size="sm"
              disabled={!categoriesDirty || savingCategories}
              onClick={handleSaveCategories}
              className="gap-1.5"
            >
              {savingCategories ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SLA & escalation</CardTitle>
          <CardDescription>
            Define how quickly each priority should be resolved and whether to auto-escalate overdue
            complaints.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(["high", "medium", "low"] as const).map((priority) => {
            const rule = sla.find((r) => r.priority === priority)!;
            const label = priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low";
            return (
              <div
                key={priority}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      priority === "high"
                        ? "destructive"
                        : priority === "medium"
                          ? "secondary"
                          : "outline"
                    }
                    className="capitalize"
                  >
                    {label}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`sla-${priority}`}
                      className="whitespace-nowrap text-xs text-muted-foreground"
                    >
                      Resolve within
                    </Label>
                    <Input
                      id={`sla-${priority}`}
                      type="number"
                      min={1}
                      value={rule.resolveWithinHours}
                      onChange={(e) =>
                        updateSla(priority, { resolveWithinHours: Number(e.target.value) || 0 })
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground">hours</span>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={rule.autoEscalateIfOverdue}
                      onCheckedChange={(v) =>
                        updateSla(priority, { autoEscalateIfOverdue: v === true })
                      }
                    />
                    <span className="text-xs text-muted-foreground">Auto-escalate if overdue</span>
                  </label>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedSlaFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved
                </span>
              )}
            </div>
            <Button
              size="sm"
              disabled={!slaDirty || savingSla}
              onClick={handleSaveSla}
              className="gap-1.5"
            >
              {savingSla ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose when committee members and residents get notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              checked={notifications.notifyCommitteeOnNew}
              onCheckedChange={(v) =>
                setNotifications((prev) => ({ ...prev, notifyCommitteeOnNew: v === true }))
              }
              className="mt-0.5"
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                Notify committee on new complaints
              </span>
              <span className="text-xs text-muted-foreground">
                Send an alert to committee members whenever a new complaint is raised.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              checked={notifications.notifyResidentOnStatusChange}
              onCheckedChange={(v) =>
                setNotifications((prev) => ({ ...prev, notifyResidentOnStatusChange: v === true }))
              }
              className="mt-0.5"
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                Notify resident on status change
              </span>
              <span className="text-xs text-muted-foreground">
                Notify the resident who raised the complaint when its status changes.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              checked={notifications.notifyOnEscalation}
              onCheckedChange={(v) =>
                setNotifications((prev) => ({ ...prev, notifyOnEscalation: v === true }))
              }
              className="mt-0.5"
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">Notify on escalation</span>
              <span className="text-xs text-muted-foreground">
                Send a notification when a complaint is escalated.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedNotificationsFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved
                </span>
              )}
            </div>
            <Button
              size="sm"
              disabled={!notificationsDirty || savingNotifications}
              onClick={handleSaveNotifications}
              className="gap-1.5"
            >
              {savingNotifications ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
