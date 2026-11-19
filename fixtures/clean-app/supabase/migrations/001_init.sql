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

alter table orders enable row level security;
alter table payments enable row level security;

create policy "owner reads orders" on orders
  for select using (auth.uid() = user_id);
create policy "owner reads payments" on payments
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
  );
