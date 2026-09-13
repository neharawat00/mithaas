REVOKE ALL ON FUNCTION public.waitlist_position(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.promote_waitlist_slot(date, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_expired_holds() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reservations_freed_slot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.waitlist_position(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_holds() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.promote_waitlist_slot(date, text) TO service_role;