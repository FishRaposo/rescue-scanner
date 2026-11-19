# shared/ui

Design system and reusable interface primitives.

## Components

- Layout: AppShell, PageHeader, Section, Card, Grid, Stack.
- Controls: Button, IconButton, Input, Select, Checkbox, Tabs, Dialog.
- Data: Table, Badge, StatusPill, EmptyState, ErrorState, LoadingState.
- Proof: SampleDataBadge, LimitNote, CopyButton, CodeBlock.
- Charts only where the piece needs them; no chart library by default.

## Rules

- One design language across the six; only the accent colour changes.
- Design tokens for colour, spacing, radius, type, shadows and motion.
- 44px minimum targets; visible focus; keyboard paths; reduced motion.
- Contrast checked with axe on key screens.
- No off-origin fonts, icons or images.
- Components render the same in demo and local modes.

## Acceptance

- Every component has a happy, empty, loading and error state where relevant.
- The sample-data badge is visible on every demo screen.
- axe is clean on the core journey and the detail screens.
