# Database Schema — RBAC + Sessions

Entity-relationship diagram of the current schema (`server/src/db/schema/`). Renders automatically on GitHub;
in VS Code install **Markdown Preview Mermaid Support** and open the preview (`Ctrl+Shift+V`).

```mermaid
erDiagram
    societies ||--o{ roles : "has"
    roles ||--o{ role_permissions : "grants"
    users ||--o{ user_roles : "holds"
    roles ||--o{ user_roles : "assigned to"
    users |o--o{ user_roles : "assigned_by"
    users ||--o{ sessions : "owns"

    societies {
        uuid id PK
        varchar name
        varchar token UK "X-Society-Token selector"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        uuid id PK
        varchar email UK
        varchar phone UK
        varchar password_hash
        varchar display_name
        boolean is_super_admin "allow-all, not society-scoped"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    roles {
        uuid id PK
        uuid society_id FK
        varchar name "unique per society"
        varchar description
        boolean is_system "seeded template"
        timestamptz created_at
        timestamptz updated_at
    }

    role_permissions {
        uuid role_id PK,FK
        varchar permission PK "code string, validated vs registry"
    }

    user_roles {
        uuid user_id PK,FK
        uuid role_id PK,FK
        uuid assigned_by FK
        timestamptz assigned_at
    }

    sessions {
        uuid id PK
        varchar token_hash UK "SHA-256, never raw"
        uuid user_id FK
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz last_used_at
        timestamptz created_at
    }
```

## Reading the relationships

- A **society** has many **roles**; deleting a society cascades to its roles.
- A **role** grants many **role_permissions** (permission strings from the code registry — no FK).
- A **user** holds many **user_roles**; a **role** is assigned to many users. The society is derived
  through the role, so effective permissions = union of the user's roles within the selected society.
- `user_roles.assigned_by` is an optional self-reference to the **user** who granted the role.
- A **user** owns many **sessions** (identity only; society is per-request, not stored).
