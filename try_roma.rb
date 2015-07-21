require 'sinatra'
require 'pathname'

base_path = Pathname(__FILE__).dirname
$LOAD_PATH.unshift("#{base_path}/")
require 'stat'
require 'balse'

get '/' do # debug
  erb :stats
end

get '/stats/?:regexp?' do |regexp|
  stat = Roma::Stat.new

  list = stat.list
  if regexp
    @res = list.select{|k, v| k =~ /#{regexp}/}
  else
    @res = list
  end
  erb :stats
end

delete '/' do
  params[:killCmd]
  list = Roma::ProcessDown.new.kill_cmd
  logger.info("params[:killCmd] = #{params[:killCmd]}")

    if res = list[params[:killCmd]]
      @res = res
    else
      raise # toDO raise NoRomaCommandError
    end
  erb :stats
end
