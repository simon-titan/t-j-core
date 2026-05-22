-- =============================================================================
-- Fix: fn_handle_new_user — skip profile creation if organization_id is missing
--
-- When users are created via Supabase Dashboard or admin API without metadata,
-- raw_user_meta_data is empty {}. The original trigger tried to insert
-- organization_id = NULL which violated the NOT NULL constraint on profiles,
-- causing "Database error saving new user".
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'organization_id') IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, role, full_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
      NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
