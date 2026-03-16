alter table users
  add column if not exists username_changed boolean not null default false;

create unique index if not exists ux_users_username_lower
  on users (lower(username));
