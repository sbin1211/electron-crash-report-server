'use strict'

module.exports = `
  DO $$
    BEGIN
      BEGIN
        ALTER TABLE reports ADD COLUMN open boolean DEFAULT TRUE;
      EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'open already exists in reports';
      END;
    END;
  $$
`
