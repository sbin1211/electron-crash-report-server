# frozen_string_literal: true

require 'dotenv/load' unless ENV.fetch('RACK_ENV') == 'production'
require 'pp'

task default: :test

require 'rake/testtask'
Rake::TestTask.new do |t|
  t.libs << 'test'
  t.test_files = FileList['test/test_*.rb']
  t.verbose = true
end

require 'rubocop/rake_task'
desc 'Run RuboCop'
RuboCop::RakeTask.new(:rubocop) do |task|
  task.options = [
    '--auto-correct',
    '--display-cop-names'
  ]
end
