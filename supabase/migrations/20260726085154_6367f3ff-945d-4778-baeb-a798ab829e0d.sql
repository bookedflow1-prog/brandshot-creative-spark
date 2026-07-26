
-- Editor scenes: structured Fabric JSON per project
CREATE TABLE public.editor_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled scene',
  canvas jsonb NOT NULL DEFAULT '{}'::jsonb,
  width integer NOT NULL DEFAULT 1080,
  height integer NOT NULL DEFAULT 1080,
  thumbnail_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editor_scenes TO authenticated;
GRANT ALL ON public.editor_scenes TO service_role;
ALTER TABLE public.editor_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scenes" ON public.editor_scenes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_editor_scenes_project ON public.editor_scenes(project_id);
CREATE TRIGGER trg_editor_scenes_updated BEFORE UPDATE ON public.editor_scenes
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Credit engine: atomic spend + refund (SECURITY DEFINER, server-side only)
CREATE OR REPLACE FUNCTION public.spend_credits(_user_id uuid, _cost integer, _reason credit_reason, _description text, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE (new_balance integer, tx_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _bal integer;
  _tx uuid;
BEGIN
  IF _cost <= 0 THEN RAISE EXCEPTION 'invalid_cost'; END IF;
  SELECT credits INTO _bal FROM public.profiles WHERE id = _user_id FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'no_profile'; END IF;
  IF _bal < _cost THEN RAISE EXCEPTION 'insufficient_credits'; END IF;
  UPDATE public.profiles SET credits = credits - _cost WHERE id = _user_id RETURNING credits INTO _bal;
  INSERT INTO public.credit_transactions (user_id, delta, reason, description, metadata)
    VALUES (_user_id, -_cost, _reason, _description, _metadata) RETURNING id INTO _tx;
  RETURN QUERY SELECT _bal, _tx;
END; $$;
REVOKE ALL ON FUNCTION public.spend_credits(uuid,integer,credit_reason,text,jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid,integer,credit_reason,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.refund_credits(_user_id uuid, _amount integer, _description text, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bal integer;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  UPDATE public.profiles SET credits = credits + _amount WHERE id = _user_id RETURNING credits INTO _bal;
  INSERT INTO public.credit_transactions (user_id, delta, reason, description, metadata)
    VALUES (_user_id, _amount, 'refund', _description, _metadata);
  RETURN _bal;
END; $$;
REVOKE ALL ON FUNCTION public.refund_credits(uuid,integer,text,jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid,integer,text,jsonb) TO service_role;

-- Seed default AI operation prices
INSERT INTO public.app_settings (key, value) VALUES
  ('ai_prices', '{"remove_background":1,"enhance_image":1,"image_to_editable":1,"magic_eraser":2,"magic_background":2,"magic_replace":2,"magic_expand":3,"ai_generate":3}'::jsonb)
ON CONFLICT (key) DO NOTHING;
