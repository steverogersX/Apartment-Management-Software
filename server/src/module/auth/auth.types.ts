/** Server-only — the per-request auth context attached by `authenticate`. Not a wire type. */
export interface RequestContext {
  userId: string;
  isSuperAdmin: boolean;
  societyId: string | null;
  permissions: ReadonlySet<string>;
}
