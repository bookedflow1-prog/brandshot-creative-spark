-- 1. Media library upgrades
ALTER TABLE public.project_assets ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE public.project_assets ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.project_assets ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
ALTER TABLE public.project_assets ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'upload';
ALTER TABLE public.project_assets ADD COLUMN IF NOT EXISTS size_bytes bigint;
ALTER TABLE public.project_assets ADD COLUMN IF NOT EXISTS duration_seconds numeric;

ALTER TYPE public.asset_kind ADD VALUE IF NOT EXISTS 'audio';

CREATE INDEX IF NOT EXISTS project_assets_user_created_idx ON public.project_assets (user_id, created_at DESC);

-- 2. Video projects
CREATE TABLE IF NOT EXISTS public.video_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled video',
  width integer NOT NULL DEFAULT 1080,
  height integer NOT NULL DEFAULT 1920,
  fps integer NOT NULL DEFAULT 30,
  duration_seconds numeric NOT NULL DEFAULT 0,
  timeline jsonb NOT NULL DEFAULT '{"version":1,"tracks":[]}'::jsonb,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_projects TO authenticated;
GRANT ALL ON public.video_projects TO service_role;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own video projects" ON public.video_projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER video_projects_touch BEFORE UPDATE ON public.video_projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 3. AI jobs
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  prompt text,
  input_path text,
  output_asset_id uuid REFERENCES public.project_assets(id) ON DELETE SET NULL,
  credits_spent integer NOT NULL DEFAULT 0,
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_jobs TO authenticated;
GRANT ALL ON public.ai_jobs TO service_role;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own ai jobs" ON public.ai_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER ai_jobs_touch BEFORE UPDATE ON public.ai_jobs
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 4. Pricing for product-photo tools
UPDATE public.app_settings
SET value = value || '{"product_scene":3,"remove_background":1,"replace_background":2,"studio_background":2,"lifestyle_shot":3,"generate_shadow":1,"object_eraser":2,"enhance":1,"upscale":2,"variation":2}'::jsonb
WHERE key = 'ai_prices';