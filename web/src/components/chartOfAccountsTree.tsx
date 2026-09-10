"use client";

import * as React from "react";
import { ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  accountGroups,
  ledgerAccounts,
  type AccountGroup,
  type AddAccountGroupInput,
  type AddLedgerAccountInput,
  type LedgerAccount,
} from "@/lib/chartOfAccountsMockData";
import { computeGroupBalance, computeLedgerBalance } from "@/lib/bankAccountsMockData";
import { AddAccountGroupForm } from "./chart-of-accounts/addAccountGroupForm";
import { AddLedgerAccountForm } from "./chart-of-accounts/addLedgerAccountForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function LedgerRow({ account }: { account: LedgerAccount }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 pl-9 hover:bg-muted/50">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-foreground">{account.name}</span>
      </div>
      <Badge variant="outline">{account.type}</Badge>
      <span className="w-28 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
        {formatCurrency(computeLedgerBalance(account.id))}
      </span>
    </div>
  );
}

function GroupNode({
  group,
  groups,
  ledgers,
  expandedIds,
  onToggle,
}: {
  group: AccountGroup;
  groups: AccountGroup[];
  ledgers: LedgerAccount[];
  expandedIds: string[];
  onToggle: (id: string) => void;
}) {
  const expanded = expandedIds.includes(group.id);
  const children = groups.filter((g) => g.parentGroupId === group.id);
  const ownLedgers = ledgers.filter((a) => a.groupId === group.id);
  const balance = computeGroupBalance(group.id);

  return (
    <Collapsible open={expanded} onOpenChange={() => onToggle(group.id)}>
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/50">
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {group.name}
        </span>
        <Badge variant="secondary">{group.type}</Badge>
        <span className="w-28 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(balance)}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col pl-4">
        {children.map((child) => (
          <GroupNode
            key={child.id}
            group={child}
            groups={groups}
            ledgers={ledgers}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
        {ownLedgers.map((a) => (
          <LedgerRow key={a.id} account={a} />
        ))}
        {children.length === 0 && ownLedgers.length === 0 && (
          <p className="px-2 py-1 pl-9 text-xs text-muted-foreground">No accounts yet.</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ChartOfAccountsTree() {
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("ChartOfAccountsManage");
  const [groups, setGroups] = React.useState<AccountGroup[]>(() => [...accountGroups]);
  const [ledgers, setLedgers] = React.useState<LedgerAccount[]>(() => [...ledgerAccounts]);
  const [expandedIds, setExpandedIds] = React.useState<string[]>(() =>
    accountGroups.filter((g) => g.parentGroupId === null).map((g) => g.id),
  );
  const [groupOpen, setGroupOpen] = React.useState(false);
  const [ledgerOpen, setLedgerOpen] = React.useState(false);

  function toggle(id: string) {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAddGroup(values: AddAccountGroupInput) {
    const group: AccountGroup = {
      id: crypto.randomUUID(),
      name: values.name,
      type: values.type,
      parentGroupId: values.parentGroupId ?? null,
    };
    accountGroups.push(group);
    setGroups((prev) => [...prev, group]);
    setExpandedIds((prev) =>
      group.parentGroupId && !prev.includes(group.parentGroupId)
        ? [...prev, group.parentGroupId]
        : prev,
    );
    recordAudit({
      module: "Accounts",
      entityType: "Account Group",
      entityId: group.id,
      entityLabel: group.name,
      action: "Create",
      performedBy: actor,
    });
    setGroupOpen(false);
  }

  function handleAddLedger(values: AddLedgerAccountInput) {
    const account: LedgerAccount = {
      id: crypto.randomUUID(),
      name: values.name,
      type: values.type,
      groupId: values.groupId,
    };
    ledgerAccounts.push(account);
    setLedgers((prev) => [...prev, account]);
    const parentId = groups.find((g) => g.id === values.groupId)?.parentGroupId ?? values.groupId;
    setExpandedIds((prev) =>
      prev.includes(parentId) ? prev : [...prev, parentId, values.groupId],
    );
    recordAudit({
      module: "Accounts",
      entityType: "Ledger Account",
      entityId: account.id,
      entityLabel: account.name,
      action: "Create",
      performedBy: actor,
    });
    setLedgerOpen(false);
  }

  const topLevel = groups.filter((g) => g.parentGroupId === null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Chart of Accounts</CardTitle>
          {canManage && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setGroupOpen(true)}
              >
                <Plus className="size-3.5" />
                Add Group
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setLedgerOpen(true)}>
                <Plus className="size-3.5" />
                Add Ledger Account
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-0.5">
          {topLevel.map((group) => (
            <GroupNode
              key={group.id}
              group={group}
              groups={groups}
              ledgers={ledgers}
              expandedIds={expandedIds}
              onToggle={toggle}
            />
          ))}
        </CardContent>
      </Card>

      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add group</DialogTitle>
            <DialogDescription>Create a new account group or sub-group.</DialogDescription>
          </DialogHeader>
          <AddAccountGroupForm
            key={String(groupOpen)}
            groups={groups}
            onSave={handleAddGroup}
            onCancel={() => setGroupOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add ledger account</DialogTitle>
            <DialogDescription>Create a new ledger account under a group.</DialogDescription>
          </DialogHeader>
          <AddLedgerAccountForm
            key={String(ledgerOpen)}
            groups={groups}
            onSave={handleAddLedger}
            onCancel={() => setLedgerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
