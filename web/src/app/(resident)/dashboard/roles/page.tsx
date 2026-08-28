import { RolesTable } from "@/components/rolesTable";

export default function RolesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Define what each role can see and do across this society.
        </p>
      </div>
      <RolesTable />
    </div>
  );
}
