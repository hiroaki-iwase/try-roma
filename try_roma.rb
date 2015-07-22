require 'sinatra'
require_relative 'tryroma_api'
require_relative 'stat'
require_relative 'balse'
#require_relative 'post_cmd'
include TryRomaAPI

configure do
  enable :sessions
end

# debug 
get '/' do
  #logger.info "version : [#{TryRomaAPI::VERSION}]"

  response.set_cookie(:foo, :value => "111", :expires => Time.now + 5)
  response.set_cookie(:bar, :value => "222", :expires => Time.now + 100)
  logger.info request.cookies['foo']
  logger.info request.cookies['bar']

  erb :stats
end

# stat/stats [regexp]
get '/stats/?:regexp?' do |regexp|
  stat = Roma::Stat.new

  res_list = stat.list
  if regexp
    @res = res_list.select{|k, v| k =~ /#{regexp}/}
  else
    @res = res_list
  end
  erb :stats
end

get %r{/(get[s]*)/(.*)}  do |i, k|
  session['hoge'] = "test_value" #debug

  if session[k]
    logical_clock = 5 if i == 'gets' # toDO
    @res = "VALUE #{k} 0 #{session[k].size} #{logical_clock}<br>#{session[k]}<br>END<br>"
  else
    @res = ""
  end

  erb :stats
end

# balse, shutdown, shutdown_self
delete '/' do
  params[:killCmd]
  res_list = Roma::ProcessDown.new.kill_cmd
  if res = res_list[params[:killCmd]]
    @res = res
  else
    raise TryRomaAPIError
  end
  erb :stats
end

# set, add, delete, replace, append, prepend, cas, set_expt, set_size_of_zredundant, incr, decr, delete
# Res Style
#   STORED/NOT_STORED => set, add, replace, append, prepend, 
#   STORED/NOT_STORED/EXISTS => cas
#   STORED/NOT_STORED/SERVER_ERROR  => set_expt
#   STORED/usage:set_set_size_of_zredundant <n>\r\n  => set_size_of_zredundant
#   DELETED/NOT_FOUND => delete
#   <digit>/NOT_FOUND => incr, decr
#
# Argument Style
#   <key> <flags> <exptime> <bytes>\r\n<value> : set, add, replace, append, prepend, 
#   <key> <flags> <exptime> <bytes> <casid>\r\n<value> : cas
#   <key> <exptime> : set_expt
#   <size> : set_size_of_zredundant
#   <key> : delete
#   <key> <digit> : incr, decr
post '/' do
  cmd = params[:command]
  k = params[:key]
  #params[:flags] = 0
  params[:exptime]
  val_size = params[:bytes].to_i
  #params[:casid]
  v = params[:value]
  #params[:size]
  #params[:digit]

  #post = Roma::PostCommand.new(params[:command])
  if can_i_set?(cmd, k)
    case cmd
    when /^(set|add|replace)$/
      session[k] = v.slice(0, val_size)
    when 'append'
      session[k].concat(v.slice(0, val_size))
    when 'prepend'
      session[k].prepend(v.slice(0, val_size))
    end
    @res = "STORED"
  else
    @res = "NOT_STORED"
  end

  erb :stats
end

private

def can_i_set?(command, key)
  if command =~ /^(add)$/
    return false if session[key]
  elsif command =~ /^(replace|append|prepend)$/
    return false unless session[key]
  end
  true
end



