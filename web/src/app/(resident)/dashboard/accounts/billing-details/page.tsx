"use client";

import * as React from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import {
  additionalCharges as initialCharges,
  billingRateSettings as initialRate,
  gstSettings as initialGst,
  lateFeeSettings as initialLateFee,
  paymentDetails as initialPayment,
} from "@/lib/billingSettingsMockData";
import type {
  AdditionalCharge,
  BillingRateSettings,
  GstSettings,
  LateFeeSettings,
  PaymentDetails,
} from "@/lib/billingSettingsMockData";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function BillingDetailsPage() {
  const { has, user } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("BillingSettingsManage");

  const [rate, setRate] = React.useState<BillingRateSettings>({ ...initialRate });
  const [savedRate, setSavedRate] = React.useState<BillingRateSettings>({ ...initialRate });
  const [savingRate, setSavingRate] = React.useState(false);
  const [savedRateFlag, setSavedRateFlag] = React.useState(false);
  const rateDirty = React.useMemo(
    () => JSON.stringify(rate) !== JSON.stringify(savedRate),
    [rate, savedRate],
  );

  async function handleSaveRate() {
    setSavingRate(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    Object.assign(initialRate, rate, { lastUpdatedBy: actor, lastUpdatedAt: now });
    setSavedRate({ ...rate, lastUpdatedBy: actor, lastUpdatedAt: now });
    setRate((prev) => ({ ...prev, lastUpdatedBy: actor, lastUpdatedAt: now }));
    recordAudit({
      module: "Accounts",
      entityType: "Billing Settings",
      entityId: "rate",
      entityLabel: "Billing Method & Rate",
      action: "Update",
      performedBy: actor,
    });
    setSavingRate(false);
    setSavedRateFlag(true);
    setTimeout(() => setSavedRateFlag(false), 2000);
  }

  const [gst, setGst] = React.useState<GstSettings>({ ...initialGst });
  const [savedGst, setSavedGst] = React.useState<GstSettings>({ ...initialGst });
  const [savingGst, setSavingGst] = React.useState(false);
  const [savedGstFlag, setSavedGstFlag] = React.useState(false);
  const gstDirty = React.useMemo(
    () => JSON.stringify(gst) !== JSON.stringify(savedGst),
    [gst, savedGst],
  );

  async function handleSaveGst() {
    setSavingGst(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    Object.assign(initialGst, gst, { lastUpdatedBy: actor, lastUpdatedAt: now });
    setSavedGst({ ...gst, lastUpdatedBy: actor, lastUpdatedAt: now });
    setGst((prev) => ({ ...prev, lastUpdatedBy: actor, lastUpdatedAt: now }));
    recordAudit({
      module: "Accounts",
      entityType: "Billing Settings",
      entityId: "gst",
      entityLabel: "GST Settings",
      action: "Update",
      performedBy: actor,
    });
    setSavingGst(false);
    setSavedGstFlag(true);
    setTimeout(() => setSavedGstFlag(false), 2000);
  }

  const [lateFee, setLateFee] = React.useState<LateFeeSettings>({ ...initialLateFee });
  const [savedLateFee, setSavedLateFee] = React.useState<LateFeeSettings>({ ...initialLateFee });
  const [savingLateFee, setSavingLateFee] = React.useState(false);
  const [savedLateFeeFlag, setSavedLateFeeFlag] = React.useState(false);
  const lateFeeDirty = React.useMemo(
    () => JSON.stringify(lateFee) !== JSON.stringify(savedLateFee),
    [lateFee, savedLateFee],
  );

  async function handleSaveLateFee() {
    setSavingLateFee(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    Object.assign(initialLateFee, lateFee, { lastUpdatedBy: actor, lastUpdatedAt: now });
    setSavedLateFee({ ...lateFee, lastUpdatedBy: actor, lastUpdatedAt: now });
    setLateFee((prev) => ({ ...prev, lastUpdatedBy: actor, lastUpdatedAt: now }));
    recordAudit({
      module: "Accounts",
      entityType: "Billing Settings",
      entityId: "late-fee",
      entityLabel: "Late Fee Rules",
      action: "Update",
      performedBy: actor,
    });
    setSavingLateFee(false);
    setSavedLateFeeFlag(true);
    setTimeout(() => setSavedLateFeeFlag(false), 2000);
  }

  const [charges, setCharges] = React.useState<AdditionalCharge[]>(() => [...initialCharges]);
  const [savedCharges, setSavedCharges] = React.useState<AdditionalCharge[]>(() => [
    ...initialCharges,
  ]);
  const [savingCharges, setSavingCharges] = React.useState(false);
  const [savedChargesFlag, setSavedChargesFlag] = React.useState(false);
  const [newChargeName, setNewChargeName] = React.useState("");
  const [newChargeAmount, setNewChargeAmount] = React.useState(500);
  const [newChargeApplicable, setNewChargeApplicable] =
    React.useState<AdditionalCharge["applicableTo"]>("All Flats");
  const chargesDirty = React.useMemo(
    () => JSON.stringify(charges) !== JSON.stringify(savedCharges),
    [charges, savedCharges],
  );

  function handleAddCharge() {
    const name = newChargeName.trim();
    if (!name) return;
    if (charges.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const newCharge: AdditionalCharge = {
      id: `ac-${Date.now()}`,
      name,
      defaultAmount: newChargeAmount,
      applicableTo: newChargeApplicable,
    };
    setCharges((prev) => [...prev, newCharge]);
    setNewChargeName("");
    setNewChargeAmount(500);
    setNewChargeApplicable("All Flats");
  }

  function handleRemoveCharge(id: string) {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharge(id: string, patch: Partial<AdditionalCharge>) {
    setCharges((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function handleSaveCharges() {
    setSavingCharges(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    initialCharges.length = 0;
    charges.forEach((c) => initialCharges.push({ ...c }));
    setSavedCharges(charges.map((c) => ({ ...c })));
    recordAudit({
      module: "Accounts",
      entityType: "Billing Settings",
      entityId: "additional-charges",
      entityLabel: "Additional Charges",
      action: "Update",
      performedBy: actor,
      details: `${charges.length} charges`,
    });
    setSavingCharges(false);
    setSavedChargesFlag(true);
    setTimeout(() => setSavedChargesFlag(false), 2000);
  }

  const [payment, setPayment] = React.useState<PaymentDetails>({ ...initialPayment });
  const [savedPayment, setSavedPayment] = React.useState<PaymentDetails>({ ...initialPayment });
  const [savingPayment, setSavingPayment] = React.useState(false);
  const [savedPaymentFlag, setSavedPaymentFlag] = React.useState(false);
  const paymentDirty = React.useMemo(
    () => JSON.stringify(payment) !== JSON.stringify(savedPayment),
    [payment, savedPayment],
  );

  async function handleSavePayment() {
    setSavingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    Object.assign(initialPayment, payment, { lastUpdatedBy: actor, lastUpdatedAt: now });
    setSavedPayment({ ...payment, lastUpdatedBy: actor, lastUpdatedAt: now });
    setPayment((prev) => ({ ...prev, lastUpdatedBy: actor, lastUpdatedAt: now }));
    recordAudit({
      module: "Accounts",
      entityType: "Billing Settings",
      entityId: "payment-details",
      entityLabel: "Payment Details",
      action: "Update",
      performedBy: actor,
    });
    setSavingPayment(false);
    setSavedPaymentFlag(true);
    setTimeout(() => setSavedPaymentFlag(false), 2000);
  }

  if (!has("BillingSettingsView")) {
    return <PermissionDenied message="You do not have permission to manage billing settings." />;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Billing Details
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure billing method, GST, late fees and payment details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Method &amp; Rate</CardTitle>
          <CardDescription>
            Choose how maintenance is calculated and when it is due.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Method</Label>
              <Select
                value={rate.method}
                onValueChange={(v) =>
                  setRate((prev) => ({ ...prev, method: v as BillingRateSettings["method"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equal Split">Equal Split</SelectItem>
                  <SelectItem value="Per Sqft">Per Sqft</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Billing cycle</Label>
              <Select
                value={rate.billingCycle}
                onValueChange={(v) =>
                  setRate((prev) => ({
                    ...prev,
                    billingCycle: v as BillingRateSettings["billingCycle"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(rate.method === "Equal Split" || rate.method === "Hybrid") && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equal-amount">Equal split amount</Label>
              <Input
                id="equal-amount"
                type="number"
                value={rate.equalSplitAmount}
                onChange={(e) =>
                  setRate((prev) => ({ ...prev, equalSplitAmount: Number(e.target.value) || 0 }))
                }
              />
            </div>
          )}

          {(rate.method === "Per Sqft" || rate.method === "Hybrid") && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-psqft">Rate per sqft</Label>
              <Input
                id="rate-psqft"
                type="number"
                step="0.1"
                value={rate.ratePerSqft}
                onChange={(e) =>
                  setRate((prev) => ({ ...prev, ratePerSqft: Number(e.target.value) || 0 }))
                }
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due-day">Due day of month</Label>
            <Input
              id="due-day"
              type="number"
              min={1}
              max={28}
              value={rate.dueDayOfMonth}
              onChange={(e) =>
                setRate((prev) => ({ ...prev, dueDayOfMonth: Number(e.target.value) || 1 }))
              }
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedRateFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved by {actor}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                disabled={!rateDirty || savingRate}
                onClick={handleSaveRate}
                className="gap-1.5"
              >
                {savingRate ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GST Settings</CardTitle>
          <CardDescription>Configure GST applicability for maintenance invoices.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={gst.gstApplicable}
              onCheckedChange={(v) => setGst((prev) => ({ ...prev, gstApplicable: v === true }))}
            />
            <span className="text-sm font-medium text-foreground">GST applicable</span>
          </label>

          {gst.gstApplicable && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gst-rate">GST rate (%)</Label>
                <Input
                  id="gst-rate"
                  type="number"
                  value={Math.round(gst.gstRate * 100)}
                  onChange={(e) =>
                    setGst((prev) => ({ ...prev, gstRate: (Number(e.target.value) || 0) / 100 }))
                  }
                  className="w-32"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={gst.gstin}
                  onChange={(e) => setGst((prev) => ({ ...prev, gstin: e.target.value }))}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedGstFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved by {actor}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                disabled={!gstDirty || savingGst}
                onClick={handleSaveGst}
                className="gap-1.5"
              >
                {savingGst ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Late Fee Rules</CardTitle>
          <CardDescription>Define late fee for overdue payments.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={lateFee.enabled}
              onCheckedChange={(v) => setLateFee((prev) => ({ ...prev, enabled: v === true }))}
            />
            <span className="text-sm font-medium text-foreground">Enable late fee</span>
          </label>

          {lateFee.enabled && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Type</Label>
                  <Select
                    value={lateFee.type}
                    onValueChange={(v) =>
                      setLateFee((prev) => ({ ...prev, type: v as LateFeeSettings["type"] }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="late-value">
                    Value {lateFee.type === "Fixed" ? "(₹)" : "(%)"}
                  </Label>
                  <Input
                    id="late-value"
                    type="number"
                    value={lateFee.value}
                    onChange={(e) =>
                      setLateFee((prev) => ({ ...prev, value: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grace-days">Grace period (days)</Label>
                <Input
                  id="grace-days"
                  type="number"
                  value={lateFee.gracePeriodDays}
                  onChange={(e) =>
                    setLateFee((prev) => ({
                      ...prev,
                      gracePeriodDays: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-32"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedLateFeeFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved by {actor}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                disabled={!lateFeeDirty || savingLateFee}
                onClick={handleSaveLateFee}
                className="gap-1.5"
              >
                {savingLateFee ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Charges</CardTitle>
          <CardDescription>
            Default extra charges included when generating invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {charges.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Input
                    value={c.name}
                    onChange={(e) => updateCharge(c.id, { name: e.target.value })}
                    className="flex-1"
                    placeholder="Name"
                  />
                  <Input
                    type="number"
                    value={c.defaultAmount}
                    onChange={(e) =>
                      updateCharge(c.id, { defaultAmount: Number(e.target.value) || 0 })
                    }
                    className="w-28"
                    placeholder="Amount"
                  />
                  <Select
                    value={c.applicableTo}
                    onValueChange={(v) =>
                      updateCharge(c.id, { applicableTo: v as AdditionalCharge["applicableTo"] })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Flats">All Flats</SelectItem>
                      <SelectItem value="Owners Only">Owners Only</SelectItem>
                      <SelectItem value="Tenants Only">Tenants Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveCharge(c.id)}
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {charges.length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No additional charges.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                value={newChargeName}
                onChange={(e) => setNewChargeName(e.target.value)}
                placeholder="Name e.g. Parking"
              />
              <Input
                type="number"
                value={newChargeAmount}
                onChange={(e) => setNewChargeAmount(Number(e.target.value) || 0)}
                placeholder="Amount"
              />
              <Select
                value={newChargeApplicable}
                onValueChange={(v) => setNewChargeApplicable(v as AdditionalCharge["applicableTo"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Flats">All Flats</SelectItem>
                  <SelectItem value="Owners Only">Owners Only</SelectItem>
                  <SelectItem value="Tenants Only">Tenants Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCharge}
              disabled={!newChargeName.trim()}
              className="w-fit gap-1.5"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedChargesFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved by {actor}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                disabled={!chargesDirty || savingCharges}
                onClick={handleSaveCharges}
                className="gap-1.5"
              >
                {savingCharges ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Bank details shown on invoices and payment reminders.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bank-name">Bank name</Label>
              <Input
                id="bank-name"
                value={payment.bankName}
                onChange={(e) => setPayment((prev) => ({ ...prev, bankName: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account-number">Account number</Label>
              <Input
                id="account-number"
                value={payment.accountNumber}
                onChange={(e) => setPayment((prev) => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ifsc">IFSC</Label>
              <Input
                id="ifsc"
                value={payment.ifsc}
                onChange={(e) => setPayment((prev) => ({ ...prev, ifsc: e.target.value }))}
                placeholder="HDFC0001234"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                value={payment.upiId}
                onChange={(e) => setPayment((prev) => ({ ...prev, upiId: e.target.value }))}
                placeholder="greenvalley@hdfcbank"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {savedPaymentFlag && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  Saved by {actor}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                disabled={!paymentDirty || savingPayment}
                onClick={handleSavePayment}
                className="gap-1.5"
              >
                {savingPayment ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
