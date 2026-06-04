
REVOKE EXECUTE ON FUNCTION public.gen_property_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_property_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gen_property_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_property_code() TO service_role;
