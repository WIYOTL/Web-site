/*
# Create Wiyotl user project actions

1. New Tables
- `wiyotl_project_actions` stores each signed-in user's wishlist and follow choices for a project.
- `id` is the row identifier.
- `user_id` identifies the owning authenticated user and defaults to the current session.
- `project_id` stores the stable project slug from the shared project catalog.
- `is_wishlisted` indicates whether the project is in the user's wishlist.
- `is_following` indicates whether the user follows project updates.
- `created_at` and `updated_at` track the record lifecycle.

2. Security
- Row level security is enabled.
- Authenticated users can only read, create, change, or remove their own action rows.
- Anonymous visitors cannot access personal account data.

3. Important Notes
- Project metadata remains defined once in the application catalog and is not duplicated here.
- A unique user/project key prevents duplicate action rows.
*/

CREATE TABLE IF NOT EXISTS public.wiyotl_project_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL,
  is_wishlisted boolean NOT NULL DEFAULT false,
  is_following boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

ALTER TABLE public.wiyotl_project_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own Wiyotl actions" ON public.wiyotl_project_actions;
CREATE POLICY "Users can view own Wiyotl actions"
  ON public.wiyotl_project_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own Wiyotl actions" ON public.wiyotl_project_actions;
CREATE POLICY "Users can create own Wiyotl actions"
  ON public.wiyotl_project_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own Wiyotl actions" ON public.wiyotl_project_actions;
CREATE POLICY "Users can update own Wiyotl actions"
  ON public.wiyotl_project_actions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own Wiyotl actions" ON public.wiyotl_project_actions;
CREATE POLICY "Users can delete own Wiyotl actions"
  ON public.wiyotl_project_actions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wiyotl_project_actions_user_id_idx
  ON public.wiyotl_project_actions (user_id);
