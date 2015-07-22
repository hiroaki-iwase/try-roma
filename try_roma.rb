require 'sinatra'
require_relative 'stat'
require_relative 'balse'
require_relative 'tryroma_api'
include TryRomaAPI

# debug 
get '/' do
  logger.info "version : [#{TryRomaAPI::VERSION}]"
  erb :stats
end

# stat/stats [regexp]
get '/?:regexp?' do |regexp|
  stat = Roma::Stat.new

  list = stat.list
  if regexp
    @res = list.select{|k, v| k =~ /#{regexp}/}
  else
    @res = list
  end
  erb :stats
end

# balse, shutdown, shutdown_self
delete '/' do
  params[:killCmd]
  list = Roma::ProcessDown.new.kill_cmd
  logger.info("params[:killCmd] = #{params[:killCmd]}")

    if res = list[params[:killCmd]]
      @res = res
    else
      raise TryRomaAPIError
    end
  erb :stats
end
