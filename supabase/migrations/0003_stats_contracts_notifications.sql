-- 0003_stats_contracts_notifications.sql
--
-- Adds the data needed for: propietario view-count stats, asesor demanda
-- analytics, inquilino contract countdown, and the per-role notification feed.
-- All policies follow the same model as 0001_init.sql: RLS on, granular SELECT,
-- writes only via service role or owner relation.

------------------------------------------------------------------------------
-- View tracking
------------------------------------------------------------------------------

ALTER TABLE properties ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS favorite_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  city text,
  property_type text,
  price_usd numeric
);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewer ON property_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at DESC);

ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS property_views_anyone_insert ON property_views;
CREATE POLICY property_views_anyone_insert ON property_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS property_views_owner_select ON property_views;
CREATE POLICY property_views_owner_select ON property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_views.property_id AND p.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS property_views_viewer_select ON property_views;
CREATE POLICY property_views_viewer_select ON property_views
  FOR SELECT USING (viewer_id = auth.uid());

CREATE OR REPLACE FUNCTION increment_property_views(p_property_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE properties SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------------------------------------------------------------------------------
-- Contracts (lease)
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  asesor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at date NOT NULL,
  months_total integer NOT NULL DEFAULT 12,
  monthly_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo', 'vencido', 'renegociacion', 'cerrado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner ON contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property ON contracts(property_id);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contracts_tenant_select ON contracts;
CREATE POLICY contracts_tenant_select ON contracts
  FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS contracts_owner_select ON contracts;
CREATE POLICY contracts_owner_select ON contracts
  FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS contracts_asesor_select ON contracts;
CREATE POLICY contracts_asesor_select ON contracts
  FOR SELECT USING (asesor_id = auth.uid());

------------------------------------------------------------------------------
-- Notifications (in-app feed; Web Push real vive en el roadmap)
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('inquilino', 'asesor', 'propietario')),
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  meta jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_own_all ON notifications;
CREATE POLICY notifications_own_all ON notifications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
