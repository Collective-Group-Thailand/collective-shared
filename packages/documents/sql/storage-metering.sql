-- Reference schema for storage metering (D-276). Each product owns its database and adapts names to its own schema;
-- this file is a template, not a migration run by the package.

-- One row per stored object (files) — written when an upload is confirmed, deleted rows keep `deleted_at`.
CREATE TABLE storage_object (
  id            uuid PRIMARY KEY,
  tenant_id     uuid NOT NULL,
  object_key    text NOT NULL UNIQUE,
  kind          text NOT NULL,
  retention     text NOT NULL CHECK (retention IN ('legal', 'operational', 'optional')),
  size_bytes    bigint NOT NULL CHECK (size_bytes >= 0),
  content_type  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX storage_object_tenant_live ON storage_object (tenant_id) WHERE deleted_at IS NULL;

-- Daily snapshot per tenant (a job at 00:05 Asia/Bangkok): files + counted records, the input of the monthly charge.
CREATE TABLE storage_usage_daily (
  tenant_id     uuid NOT NULL,
  day           date NOT NULL,
  file_bytes    bigint NOT NULL,
  record_counts jsonb NOT NULL,           -- { "invoice": 1203, "meter_reading": 8800, … }
  counted_bytes bigint NOT NULL,          -- countedBytes(usage, policy) with the policy in force that day
  policy_version text NOT NULL,           -- settings version used, for audit
  PRIMARY KEY (tenant_id, day)
);

-- Notices already sent (80 % / 100 %), so each is sent once per crossing.
CREATE TABLE storage_notice (
  tenant_id     uuid NOT NULL,
  threshold_pct integer NOT NULL,
  sent_at       timestamptz NOT NULL DEFAULT now(),
  cleared_at    timestamptz,
  PRIMARY KEY (tenant_id, threshold_pct, sent_at)
);
