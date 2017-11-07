# frozen_string_literal: true

require 'base64'
require 'logger'
require 'roda'
require 'roda/plugins/basic_auth'
require 'sequel'

DB ||= Sequel.connect(ENV.fetch('DATABASE_URL'))
DB.loggers << Logger.new(STDOUT) unless ENV.fetch('RACK_ENV') == 'test'
DB.extension :pg_json
DB.freeze if ENV.fetch('RACK_ENV') == 'production'
DB.disconnect

class Server < Roda
  auth = [ENV.fetch('AUTH_USER'), ENV.fetch('AUTH_PASS')]

  use Rack::CommonLogger, Logger.new(STDOUT)
  use Rack::MethodOverride

  plugin :all_verbs
  plugin :basic_auth, authenticator: proc { |user, pass| auth == [user, pass] }
  plugin :cookies, secret: ENV.fetch('SESSION_SECRET')
  plugin :head
  plugin :json
  plugin :pass
  plugin :public
  plugin :render, engine_opts: { freeze: true }, escape: :erubi

  route do |r|
    @title = 'Electron crash report server'

    r.is '' do
      # route: POST /
      r.post do
        unless request.params['upload_file_minidump']
          response.status = 400
          r.pass
        end

        temp = request.params['upload_file_minidump'][:tempfile] ||
               request.params['upload_file_minidump']['tempfile'][:tempfile]
        body = Sequel.pg_json(request.params.dup)
        file = File.read(temp)
        dump = Sequel::SQL::Blob.new(file)

        body.delete('upload_file_minidump')

        DB[:reports].insert(body: body, dump: dump)

        {}
      end

      # route: GET /
      r.get do
        r.basic_auth

        cookie = Base64.encode64("#{auth[0]}:#{auth[1]}").strip
        response.set_cookie('authorization', cookie)

        @reports = DB[:reports].reverse(:created_at).all

        view 'index'
      end
    end

    r.basic_auth

    r.on 'reports', Integer do |id|
      @report = DB[:reports].where(id: id)

      r.is do
        # route: GET /reports/:id
        r.get do
          view 'report'
        end

        # route: DELETE /reports/:id
        r.delete do
          @report.delete

          {}
        end
      end

      r.is 'dump' do
        # route: GET /reports/:id/dump
        r.get do
          filename = "crash-#{id}.dmp"
          response['Content-Disposition'] = "attachment; filename=#{filename}"
          response['Content-Type'] = 'application/x-dmp'

          @report.first[:dump]
        end
      end
    end

    # Serve static assets from public/
    r.public
  end
end
