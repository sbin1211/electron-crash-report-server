# frozen_string_literal: true

source 'https://rubygems.org'
ruby '2.4.2'

gem 'erubi', '~> 1.7'
gem 'pg', '~> 0.21'
gem 'rake', '~> 12.2', require: false
gem 'roda', '~> 3.1'
gem 'roda-basic-auth', '~> 0.1'
gem 'sequel', '~> 5.2'
gem 'sequel_pg', '~> 1.8'
gem 'sequel_postgresql_triggers', '~> 1.3'
gem 'tilt', '~> 2.0'

group :development do
  gem 'auto_reloader', '~> 0.4'
  gem 'minitest-autotest', '~> 1.0', require: false
  gem 'pry', '~> 0.11', require: false
  gem 'puma', '~> 3.10', require: false
end

group :test do
  gem 'minitest', '~> 5.10'
  gem 'minitest-power_assert', '~> 0.3'
  gem 'minitest-reporters', '~> 1.1'
  gem 'rack-test', '~> 0.7'
  gem 'simplecov', '~> 0.15', require: false
end

group :development, :production do
  gem 'foreman', '~> 0.84', require: false
  gem 'passenger', '~> 5.1', require: false
end

group :development, :test do
  gem 'dotenv', '~> 2.2'
  gem 'rubocop', '~> 0.51', require: false
end
