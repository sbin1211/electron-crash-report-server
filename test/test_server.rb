# frozen_string_literal: true

require 'test_helper'

class TestServer < SequelTestCase
  def create_report
    body = Sequel.pg_json(YAML.load_file('./test/fixtures/report.yml'))
    file = File.read('./test/fixtures/crash.dmp')
    dump = Sequel::SQL::Blob.new(file)
    id = DB[:reports].insert(body: body, dump: dump)

    DB[:reports].where(id: id).first
  end

  def destroy_report(report)
    DB[:reports].where(id: report[:id]).delete
  end

  def sign_in
    user = 'crash'
    pass = 'electron'
    header 'Authorization', 'Basic ' + ["#{user}:#{pass}"].pack('m*')
  end

  def test_index_must_respond_successfully_to_authorized_user
    sign_in
    get '/'
    assert { last_response.ok? }
  end

  def test_index_must_respond_with_error_to_unauthorized_user
    get '/'
    assert { last_response.unauthorized? }
  end

  def test_reports_show_must_respond_successfully_to_authorized_user
    report = create_report

    sign_in
    get "/reports/#{report[:id]}"
    assert { last_response.ok? }

    destroy_report(report)
  end

  def test_reports_show_must_respond_with_error_to_unauthorized_user
    report = create_report

    get "/reports/#{report[:id]}"
    assert { last_response.unauthorized? }

    destroy_report(report)
  end

  def test_reports_dump_must_respond_successfully_to_authorized_user
    report = create_report

    sign_in
    get "/reports/#{report[:id]}/dump"
    assert { last_response.ok? }

    destroy_report(report)
  end

  def test_reports_dump_must_respond_with_error_to_unauthorized_user
    report = create_report

    get "/reports/#{report[:id]}/dump"
    assert { last_response.unauthorized? }

    destroy_report(report)
  end

  def test_reports_delete_must_respond_successfully_to_authorized_user
    count = DB[:reports].count
    report = create_report

    sign_in
    delete "/reports/#{report[:id]}"
    assert { last_response.ok? }
    assert { count == DB[:reports].count }
  end

  def test_reports_delete_must_respond_with_error_to_unauthorized_user
    report = create_report

    delete "/reports/#{report[:id]}"
    assert { last_response.unauthorized? }

    destroy_report(report)
  end

  def test_reports_post_must_respond_with_error_to_bad_requests
    post '/'
    assert { last_response.bad_request? }
  end

  def test_reports_post_must_respond_successfully_to_valid_requests
    count = DB[:reports].count
    tempfile = Rack::Test::UploadedFile.new('./test/fixtures/crash.dmp')

    post '/',
         'pid' => '22029',
         'ptime' => '546',
         'lsb-release' => 'Fedora release 26 (Twenty Six)',
         'prod' => 'Electron',
         'ver' => '1.7.9',
         '_companyName' => 'Electron crash report server',
         '_productName' => 'electron-bomb',
         '_version' => '1.0.0',
         'extra' => 'info from the renderer process',
         'platform' => 'linux',
         'process_type' => 'renderer',
         'upload_file_minidump' => {
           filename: 'dump',
           type: 'application/octet-stream',
           name: 'upload_file_minidump',
           tempfile: tempfile,
           head: 'Content-Disposition: form-data; name=\'upload_file_minidump\'; filename=\'dump\'\r\nContent-Type: application/octet-stream\r\n'
         }

    assert { last_response.ok? }
    assert { DB[:reports].count == count + 1 }

    DB[:reports].delete
  end

  def test_files_in_public_must_respond_successfully_to_authorized_user
    sign_in
    get '/favicon.png'
    assert { last_response.ok? }
  end

  def test_files_in_public_must_respond_with_error_to_unauthorized_user
    get '/favicon.png'
    assert { last_response.unauthorized? }
  end
end
