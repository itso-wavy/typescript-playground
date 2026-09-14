begin;
select plan(6);

insert into public.owner_allowlist (user_id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select is(
  (public.save_lesson_progress('g01', 1, '{"index.ts":"one"}', null, null, '', 0)->>'status'),
  'saved',
  'first save creates revision one'
);
select is(
  (public.save_lesson_progress('g01', 1, '{"index.ts":"two"}', null, null, '', 0)->>'status'),
  'conflict',
  'a stale simultaneous insert is a conflict, never an overwrite'
);
select is(
  (public.save_lesson_progress('g01', 1, '{"index.ts":"two"}', null, null, '', 1)->>'status'),
  'saved',
  'matching revision updates atomically'
);
select results_eq(
  $$ select revision from public.lesson_progress where lesson_id = 'g01' $$,
  array[2::bigint],
  'CAS update increments the revision'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select is_empty(
  $$ select * from public.lesson_progress where lesson_id = 'g01' $$,
  'an allowlisted but different user cannot read another owner row'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select is_empty(
  $$ select * from public.lesson_progress $$,
  'a user absent from the owner allowlist cannot read progress'
);

select * from finish();
rollback;
