require 'sinatra'
require 'omniauth'

use Rack::Session::Cookie

use OmniAuth::Builder do
  provider :github,   ENV['GITHUB_CLIENTID'], ENV['GITHUB_SECRET'] do |o|
    o.authorize_params = {:scope => 'user,repo'}
  end
end

get '/' do
  <<-HTML
  <ul>
    <li><a href='/auth/github'>Sign in with GitHub</a></li>
  </ul>
  HTML
end

get '/auth/:provider/callback' do
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect
end
