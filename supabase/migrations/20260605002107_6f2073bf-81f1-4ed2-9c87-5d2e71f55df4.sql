-- Fix: DEFAULT gen_property_code() runs as the inserting user (authenticated),
-- so we must allow EXECUTE. Make the function SECURITY DEFINER so it can use
-- the sequence regardless of caller privileges. The BEFORE INSERT/UPDATE
-- trigger still enforces immutability.
CREATE OR REPLACE FUNCTION public.gen_property_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 'MAD-' || nextval('public.property_code_seq')::TEXT;
$function$;

GRANT EXECUTE ON FUNCTION public.gen_property_code() TO authenticated, anon;