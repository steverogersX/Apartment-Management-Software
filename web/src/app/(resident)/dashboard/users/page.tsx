import { UsersTable } from "@/components/usersTable";

export default function UsersPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage who has access to this society and what they can do.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
