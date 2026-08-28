"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2, UserPlus } from "lucide-react";
import type { RoleResponse, VehicleInput } from "@shared/index";
import { createUserBodySchema, type CreateUserBody } from "@shared/index";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { listRolesRequest } from "@/lib/roleApi";
import { createUserRequest } from "@/lib/userApi";
import { ApiClientError } from "@/lib/apiClient";

const EMPTY_VEHICLE: VehicleInput = {
  registrationNumber: "",
  type: "car",
  make: "",
  model: "",
  color: "",
  parkingSlot: "",
};

const DEFAULT_VALUES: CreateUserBody = {
  name: "",
  email: "",
  phone: "",
  flatNumber: "",
  occupation: "",
  vehicles: [],
  roleIds: [],
};

function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}

export function CreateUserForm() {
  const router = useRouter();
  const { token, activeSociety } = useAuth();
  const [roles, setRoles] = React.useState<RoleResponse[]>([]);
  const [rolesError, setRolesError] = React.useState<string | undefined>();
  const [formError, setFormError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!token || !activeSociety) return;
    listRolesRequest(token, activeSociety.societyToken, activeSociety.societyId)
      .then(setRoles)
      .catch((err) =>
        setRolesError(err instanceof ApiClientError ? err.message : "Failed to load roles"),
      );
  }, [token, activeSociety]);

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: createUserBodySchema },
    onSubmit: async ({ value }) => {
      if (!token || !activeSociety) {
        setFormError("No active society session");
        return;
      }
      setFormError(undefined);
      try {
        await createUserRequest(token, activeSociety.societyToken, activeSociety.societyId, value);
        router.push("/dashboard/users");
      } catch (err) {
        setFormError(err instanceof ApiClientError ? err.message : "Failed to create user");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <Card>
        <CardHeader>
          <CardTitle>User details</CardTitle>
          <CardDescription>Basic contact information for the invite.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-name">Full name</Label>
                  <Input
                    id="user-name"
                    placeholder="Priya Sharma"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="priya@society.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {fieldError(field.state.meta.errors) && (
                    <p className="text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-phone">Phone (optional)</Label>
                  <Input
                    id="user-phone"
                    placeholder="+91 98765 43210"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="flatNumber">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-flat">Flat number (optional)</Label>
                  <Input
                    id="user-flat"
                    placeholder="304"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Not linked to a flat record yet — owner/tenant assignment needs a flats lookup.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="occupation">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-occupation">Occupation (optional)</Label>
                  <Input
                    id="user-occupation"
                    placeholder="Software Engineer"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <form.Field name="vehicles" mode="array">
          {(field) => (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vehicles</CardTitle>
                    <CardDescription>Vehicles owned by this user (optional).</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => field.pushValue({ ...EMPTY_VEHICLE })}
                  >
                    <Plus className="size-3.5" />
                    Add vehicle
                  </Button>
                </div>
              </CardHeader>
              {field.state.value.length > 0 && (
                <CardContent className="flex flex-col gap-4">
                  {field.state.value.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Vehicle {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => field.removeValue(index)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <form.Field name={`vehicles[${index}].registrationNumber`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <Label>Registration number</Label>
                              <Input
                                placeholder="TS09 AB 1234"
                                value={subField.state.value}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                                aria-invalid={subField.state.meta.errors.length > 0}
                              />
                              {fieldError(subField.state.meta.errors) && (
                                <p className="text-xs text-destructive">
                                  {fieldError(subField.state.meta.errors)}
                                </p>
                              )}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`vehicles[${index}].type`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Type</Label>
                              <Select
                                value={subField.state.value}
                                onValueChange={(v) =>
                                  subField.handleChange(v as VehicleInput["type"])
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    {(value: string) => (value === "car" ? "Car" : "Two-wheeler")}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="car">Car</SelectItem>
                                  <SelectItem value="two_wheeler">Two-wheeler</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`vehicles[${index}].make`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Make</Label>
                              <Input
                                placeholder="Hyundai"
                                value={subField.state.value ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`vehicles[${index}].model`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Model</Label>
                              <Input
                                placeholder="Creta"
                                value={subField.state.value ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`vehicles[${index}].color`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Color</Label>
                              <Input
                                placeholder="White"
                                value={subField.state.value ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`vehicles[${index}].parkingSlot`}>
                          {(subField) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Parking slot</Label>
                              <Input
                                placeholder="B-12"
                                value={subField.state.value ?? ""}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </>
          )}
        </form.Field>
      </Card>

      <Card>
        <form.Field name="roleIds">
          {(field) => (
            <>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  {field.state.value.length} of {roles.length} roles selected. A user can hold more
                  than one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rolesError ? (
                  <p className="text-sm text-destructive">{rolesError}</p>
                ) : roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading roles…</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-start gap-2.5 rounded-md p-1.5 text-sm hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={field.state.value.includes(role.id)}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            field.handleChange(
                              isChecked
                                ? [...field.state.value, role.id]
                                : field.state.value.filter((id) => id !== role.id),
                            );
                          }}
                          className="mt-0.5"
                        />
                        <span className="flex flex-col">
                          <span className="font-medium text-foreground">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {fieldError(field.state.meta.errors) && (
                  <p className="mt-2 text-xs text-destructive">
                    {fieldError(field.state.meta.errors)}
                  </p>
                )}
              </CardContent>
            </>
          )}
        </form.Field>
      </Card>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
            {formError ? <p className="text-xs text-destructive">{formError}</p> : <span />}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/users")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="gap-1.5">
                <UserPlus className="size-3.5" />
                {isSubmitting ? "Sending invite…" : "Send invite"}
              </Button>
            </div>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
