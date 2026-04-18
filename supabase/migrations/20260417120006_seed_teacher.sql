-- Teacher seed. Run manually after provisioning via:
--   pnpm supabase db push            (applies schema)
--   then either:
--     (a) sign up the teacher through the normal /signup flow, then:
--         update public.profiles set role = 'teacher' where id = '<uuid>';
--     (b) or create via Supabase dashboard Auth > Users, then same update.
--
-- This file is intentionally empty of data statements so it's safe to commit and re-apply.
-- Teacher identity should not live in version-controlled SQL.

-- No-op placeholder so the migration has a valid statement.
select 1;
