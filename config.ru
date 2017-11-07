# frozen_string_literal: true

case ENV.fetch('RACK_ENV')
when 'development'
  require 'dotenv/load'
  require 'auto_reloader'

  AutoReloader.activate(reloadable_paths: [__dir__])

  # rubocop:disable Style/Lambda
  run ->(env) {
    AutoReloader.reload! do
      require_relative 'server'

      Server.call(env)
    end
  }
  # rubocop:enable Style/Lambda
when 'production'
  require_relative 'server'

  run Server.freeze.app
else
  require 'dotenv/load'
  require_relative 'server'

  run Server
end
