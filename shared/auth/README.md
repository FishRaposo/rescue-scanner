# shared/auth

Local session, roles and tenant scoping for the pieces that need them.

## Interface

```ts
authorize(actor, action, resource): Decision
```

- One seam; no scattered permission checks.
- `actor`: user id, tenant id, role.
- `action`: read, write, manage_members, manage_billing.
- `resource`: tenant-scoped record.
- `Decision`: allow or deny with a reason code.

## Rules

- Tenant scoping is applied at the repository/query layer as well as the policy layer.
- Roles: owner, member, viewer; no implicit admin.
- Cross-tenant access is denied and audited.
- Denials have zero side effects.
- Sessions use a local cookie in local mode; the demo uses a mock session.
- Optional real Supabase adapter behind a flag; never required.

## Tests

- Role matrix: role × action × resource.
- Cross-tenant denial for every resource type.
- Denial audit event.
- No live Supabase cloud in the default suite.
