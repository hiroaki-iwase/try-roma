require 'sinatra'
require 'pathname'

base_path = Pathname(__FILE__).dirname
$LOAD_PATH.unshift("#{base_path}/")
require 'stat'

get '/stats/?:regexp?' do |regexp|
  @stat = Roma::Stat.new
  if regexp
  logger.info("regexp => #{regexp}")
    @list = @stat.list.select{|k, v| k =~ /#{regexp}/}
  else
    @list = @stat.list
  end
  erb :stats
end
