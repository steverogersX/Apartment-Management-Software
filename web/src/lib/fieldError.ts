/** First validation message from a TanStack Form field's `meta.errors`, whatever shape it has. */
export function fieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const issue = errors[0];
  if (typeof issue === "string") return issue;
  if (issue && typeof issue === "object" && "message" in issue) {
    return String((issue as { message: unknown }).message);
  }
  return String(issue);
}
