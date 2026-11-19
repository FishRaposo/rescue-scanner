create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  amount_cents integer,
  email text
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id)
);

alter table payments enable row level security;
create policy "anyone" on payments for all using (true);
