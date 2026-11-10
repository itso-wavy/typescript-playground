create schema if not exists private;

create table if not exists public.owner_allowlist (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null,
  lesson_id text not null check (length(lesson_id) between 1 and 64),
  lesson_revision integer not null check (lesson_revision > 0),
  files jsonb not null check (jsonb_typeof(files) = 'object'),
  revision bigint not null check (revision > 0),
  completed_at timestamptz,
  completed_code text,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.preferences (
  user_id uuid not null,
  key text not null check (key in ('last_lesson')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.owner_allowlist enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.preferences enable row level security;

create or replace function private.is_allowed_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.owner_allowlist
      where user_id = auth.uid()
    );
$$;

revoke all on table public.owner_allowlist from anon, authenticated;
revoke all on table public.lesson_progress from anon, authenticated;
revoke all on table public.preferences from anon;
grant select on table public.lesson_progress to authenticated;
grant select, insert, update, delete on table public.preferences to authenticated;

create policy "owner reads own progress"
on public.lesson_progress for select to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner inserts own progress"
on public.lesson_progress for insert to authenticated
with check ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner updates own progress"
on public.lesson_progress for update to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()))
with check ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner deletes own progress"
on public.lesson_progress for delete to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()));

create policy "owner reads own preferences"
on public.preferences for select to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner inserts own preferences"
on public.preferences for insert to authenticated
with check ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner updates own preferences"
on public.preferences for update to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()))
with check ((select private.is_allowed_owner()) and user_id = (select auth.uid()));
create policy "owner deletes own preferences"
on public.preferences for delete to authenticated
using ((select private.is_allowed_owner()) and user_id = (select auth.uid()));

create or replace function public.save_lesson_progress(
  p_lesson_id text,
  p_lesson_revision integer,
  p_files jsonb,
  p_completed_at timestamptz,
  p_completed_code text,
  p_note text,
  p_expected_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_row public.lesson_progress;
  saved_row public.lesson_progress;
begin
  if auth.uid() is null or not private.is_allowed_owner() then
    raise exception 'owner authorization required' using errcode = '42501';
  end if;
  if p_expected_version < 0 or p_lesson_revision < 1 or jsonb_typeof(p_files) <> 'object' then
    raise exception 'invalid progress payload' using errcode = '22023';
  end if;

  insert into public.lesson_progress (
    user_id, lesson_id, lesson_revision, files, revision, completed_at, completed_code, note
  ) values (
    auth.uid(), p_lesson_id, p_lesson_revision, p_files, 1, p_completed_at, p_completed_code, coalesce(p_note, '')
  ) on conflict (user_id, lesson_id) do nothing
  returning * into saved_row;

  if found then
    if p_expected_version <> 0 then
      raise exception 'expected version must be zero for a new lesson' using errcode = '22023';
    end if;
    return jsonb_build_object('status', 'saved', 'progress', jsonb_build_object(
      'lesson_id', saved_row.lesson_id, 'lesson_revision', saved_row.lesson_revision,
      'files', saved_row.files, 'revision', saved_row.revision, 'completed_at', saved_row.completed_at,
      'completed_code', saved_row.completed_code, 'note', saved_row.note, 'updated_at', saved_row.updated_at
    ));
  end if;

  select * into current_row
  from public.lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id
  for update;

  if current_row.revision <> p_expected_version then
    return jsonb_build_object('status', 'conflict', 'progress', jsonb_build_object(
      'lesson_id', current_row.lesson_id, 'lesson_revision', current_row.lesson_revision,
      'files', current_row.files, 'revision', current_row.revision, 'completed_at', current_row.completed_at,
      'completed_code', current_row.completed_code, 'note', current_row.note, 'updated_at', current_row.updated_at
    ));
  end if;

  update public.lesson_progress
  set lesson_revision = p_lesson_revision,
      files = p_files,
      revision = current_row.revision + 1,
      completed_at = p_completed_at,
      completed_code = p_completed_code,
      note = coalesce(p_note, ''),
      updated_at = now()
  where user_id = auth.uid() and lesson_id = p_lesson_id
  returning * into saved_row;

  return jsonb_build_object('status', 'saved', 'progress', jsonb_build_object(
    'lesson_id', saved_row.lesson_id, 'lesson_revision', saved_row.lesson_revision,
    'files', saved_row.files, 'revision', saved_row.revision, 'completed_at', saved_row.completed_at,
    'completed_code', saved_row.completed_code, 'note', saved_row.note, 'updated_at', saved_row.updated_at
  ));
end;
$$;

revoke all on function private.is_allowed_owner() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_allowed_owner() to authenticated;
revoke all on function public.save_lesson_progress(text, integer, jsonb, timestamptz, text, text, bigint) from public, anon;
grant execute on function public.save_lesson_progress(text, integer, jsonb, timestamptz, text, text, bigint) to authenticated;
