-- Development seed only. Program codes are unique inside this organization,
-- while UUIDs remain the actual primary keys.
insert into public.organizations (id, name, slug)
values ('10000000-0000-4000-8000-000000000001', 'Milford Mill High School', 'milford-mill')
on conflict (id) do update set name = excluded.name;

insert into public.programs (id, org_id, kind, sport, name, code, sort_order)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'sport', 'basketball', 'Basketball', 'BASKETBALL', 1)
on conflict (id) do nothing;

insert into public.programs (id, org_id, parent_program_id, kind, sport, name, code, level, gender, sort_order)
values
  ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'team', 'basketball', 'Varsity Girls', 'VG', 'varsity', 'girls', 1),
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'team', 'basketball', 'JV Girls', 'JVG', 'jv', 'girls', 2),
  ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'team', 'basketball', 'Varsity Boys', 'VB', 'varsity', 'boys', 3),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'team', 'basketball', 'JV Boys', 'JVB', 'jv', 'boys', 4)
on conflict (id) do nothing;
