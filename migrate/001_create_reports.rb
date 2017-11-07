# frozen_string_literal: true

Sequel.migration do
  up do
    extension :pg_triggers

    create_table :reports do
      primary_key :id
      boolean     :open, default: true
      bytea       :dump, null: false
      jsonb       :body, null: false
      tsvector    :search

      DateTime :closed_at
      DateTime :created_at, null: false
      DateTime :updated_at, null: false
    end

    pgt_created_at :reports,
                   :created_at,
                   function_name: :reports_set_created_at,
                   trigger_name: :set_created_at

    pgt_updated_at :reports,
                   :updated_at,
                   function_name: :reports_set_updated_at,
                   trigger_name: :set_updated_at

    run 'CREATE INDEX IF NOT EXISTS idx_reports ON reports USING GIN(body jsonb_path_ops);'
    run 'CREATE INDEX IF NOT EXISTS idx_reports_search ON reports USING GIN(search);'
  end

  down do
    drop_trigger  :reports, :set_created_at
    drop_function :reports_set_created_at

    drop_trigger  :reports, :set_updated_at
    drop_function :reports_set_updated_at

    drop_table :reports
  end
end
