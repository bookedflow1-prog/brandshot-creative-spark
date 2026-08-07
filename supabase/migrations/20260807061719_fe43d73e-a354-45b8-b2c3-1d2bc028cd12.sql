REVOKE ALL ON FUNCTION public.spend_credits(uuid, integer, credit_reason, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, credit_reason, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text, jsonb) TO service_role;