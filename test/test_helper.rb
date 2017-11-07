# frozen_string_literal: true

$VERBOSE = nil
require 'dotenv/load'
ENV['DATABASE_URL'] = 'postgres://localhost/electron_crash_report_server_test'
ENV['RACK_ENV'] = 'test'

if ENV['CI'] || ENV['COV']
  require 'simplecov'
  SimpleCov.start do
    add_filter '/test/'
  end
end

require 'minitest/autorun'
require 'minitest/power_assert'
require 'minitest/reporters'
require 'pp'
require 'rack/test'
require 'sequel'
require 'yaml'

DB ||= Sequel.connect(ENV.fetch('DATABASE_URL'))
DB.extension :pg_json

Minitest::Reporters.use!(Minitest::Reporters::DefaultReporter.new)

class SequelTestCase < Minitest::Test
  include Rack::Test::Methods

  def app
    require_relative '../server.rb'
    Rack::Builder.new.run Server
  end
end
