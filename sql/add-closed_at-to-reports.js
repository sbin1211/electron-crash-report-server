'use strict'

module.exports = `
  DO $$
    BEGIN
      BEGIN
        ALTER TABLE reports ADD COLUMN closed_at timestamptz;
      EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'closed_at already exists in reports';
      END;
    END;
  $$
`
