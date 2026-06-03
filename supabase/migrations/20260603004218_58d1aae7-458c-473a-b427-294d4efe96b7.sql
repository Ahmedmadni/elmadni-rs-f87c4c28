-- 1) Add marketer role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketer';

-- 2) Unique phone on profiles (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON public.profiles ((lower(phone))) WHERE phone IS NOT NULL AND phone <> '';

-- 3) audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- 4) Notification on property review_status change
CREATE OR REPLACE FUNCTION public.notify_property_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.review_status IS DISTINCT FROM OLD.review_status AND NEW.owner_id IS NOT NULL THEN
    IF NEW.review_status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (NEW.owner_id, 'property_approved', 'تم اعتماد عقارك',
              'تم اعتماد عقار: ' || NEW.title, '/properties/' || NEW.id::text);
    ELSIF NEW.review_status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (NEW.owner_id, 'property_rejected', 'تم رفض عقارك',
              COALESCE('سبب الرفض: ' || NEW.rejection_reason, 'تم رفض عقار: ' || NEW.title),
              '/dashboard');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_property_status ON public.properties;
CREATE TRIGGER trg_notify_property_status
AFTER UPDATE OF review_status ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.notify_property_status_change();

-- 5) Allow notifications insert from triggers/service (definer functions bypass RLS, but ensure no policy required)
-- (notifications table currently has no INSERT policy — definer trigger inserts as table owner, which bypasses RLS.)
