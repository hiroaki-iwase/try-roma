require 'sinatra'
require_relative 'tryroma_api'
require 'thread'

include TryRomaAPI

configure do
  use Rack::Session::Pool, :expire_after => 3600 # 10min
end

helpers do
  include Rack::Utils
  alias_method :h, :escape_html
end

before do
  session[:version]      = Roma::Version.new      unless session[:version]
  session[:config]       = Roma::Config.new       unless session[:config]
  session[:stat]         = Roma::Stats.new        unless session[:stats]
  session[:storage]      = Roma::Storage.new      unless session[:storage]
  session[:write_behind] = Roma::WriteBehind.new  unless session[:write_behind]
  session[:routing]      = Roma::Routing.new      unless session[:routing]
  session[:connection]   = Roma::Connection.new   unless session[:connetion]
  session[:others]       = Roma::Others.new       unless session[:others]
end

# debug 
get '/' do
"
  #{session[:version]}<br>
  #{session[:version].class}<br>
  #{session[:version].get_stat}<br>
  ==============================================================================================<br>
  #{session[:config]}<br>
  #{session[:config].class}<br>
  #{session[:config].get_stat}<br>
  ==============================================================================================<br>
  #{session[:stat]}<br>
  #{session[:stat].class}<br>
  #{session[:stat].get_stat.class}<br>
  #{session[:stat].get_stat.size}<br>
  #{session[:stat].get_stat}<br>
  ===============================================================================================<br>
  #{session[:storage]}<br>
  #{session[:storage].class}<br>
  #{session[:storage].get_stat}<br>
  ===============================================================================================<br>
  #{session[:write_behind]}<br>
  #{session[:write_behind].class}<br>
  #{session[:write_behind].get_stat}<br>
  ===============================================================================================<br>
  #{session[:routing]}<br>
  #{session[:routing].class}<br>
  #{session[:routing].get_stat}<br>
  ===============================================================================================<br>
  #{session[:connection]}<br>
  #{session[:connection].class}<br>
  #{session[:connection].get_stat}<br>
  ===============================================================================================<br>
  #{session[:others]}<br>
  #{session[:others].class}<br>
  #{session[:others].get_stat}<br>
"
end

###[GET]============================================================================================================
# stat/stats [regexp]
get %r{/stat[s]*/?(.*)?} do |regexp|
  #@res = session[:stats].list.select{|k, v| k =~ /#{regexp}/}
  @res = session[:version].get_stat\
           .merge(session[:config].get_stat)\
           .merge(session[:stat].get_stat)\
           .merge(session[:storage].get_stat)\
           .merge(session[:write_behind].get_stat)\
           .merge(session[:routing].get_stat)\
           .merge(session[:connection].get_stat)\
           .merge(session[:others].get_stat)
 
  erb :stats
end


=begin
# whoami/nodelist/version
get %r{^/(whoami|nodelist|version)$} do |cmd|
  #stat = Roma::Stat.new
  #res_list = stat.list

  stat_list = session[:stat].list

  case cmd
  when 'whoami'
    @res = stat_list['stats.name']
  when 'nodelist'
    nodelist = stat_list['routing.nodes']
    @res = nodelist.chomp.gsub(/"|\[|\]|\,/, '')
  when 'version'
    @res = "VERSION ROMA-#{stat_list['version']}"
  end

  erb :stats
end



# get/gets <key>
get %r{/(get[s]*)/(.*)}  do |cmd, k|
  if v = request.cookies[k]
    h = revert_hash_from_string(v)
    value = h['value']
    clk   = h['clk'] if cmd == 'gets'

    @res = "VALUE #{k} 0 #{value.size} #{clk}<br>#{value}<br>END<br>"
  else
    @res = "END<br>"
  end

  erb :stats
end




# set_latency_avg_calc_rule <on|off> [time] [command1] [command2]....
#get '/set_latency_avg_calc_rule/:bool/?:time?/?*?' do |bool, time, cmds|
#get '/set_latency_avg_calc_rule/:bool/?:time?/?*?' do |bool, time, cmds|
#
#  logger.info "enter else"
#  stat = Roma::Stat.new
#
#  res_list = stat.list
#
#  if bool == 'on' && time && !cmds.empty?
#    @res = res_list['routing.version_of_nodes'].gsub(/=>\d+/, '=>"ACTIVATED"')
#  elsif bool == 'off' && !time && cmds.empty?
#    @res = res_list['routing.version_of_nodes'].gsub(/=>\d+/, '=>"DEACTIVATED"')
#  else
#    logger.info "enter else"
#    if bool == 'on' 
#      if !time || cmds.empty?
#        error_message = 'number of arguments (0 for 3) and <count> must be greater than zero'
#      end
#    elsif bool == 'off' 
#      if time || !cmds.empty?
#        error_message = 'number of arguments (0 for 1, or more 3)'
#      end
#    else
#      error_message = 'argument 1: please input "on" or "off"'
#    end
#    @res = "CLIENT_ERROR #{error_message}"
#  end
#
#
#
#  #if bool == 'on' # if bool = 'on' && time && !cms.empty?
#  #  if !time || cmds.empty?
#  #    error_message = 'number of arguments (0 for 3) and <count> must be greater than zero'
#  #    @res = "CLIENT_ERROR #{error_message}"
#  #  else
#  #    #success
#  #    @res = res_list['routing.version_of_nodes'].gsub(/=>\d+/, '=>"ACTIVATED"')
#  #  end
#  #elsif bool == 'off'
#  #  if time || !cmds.empty?
#  #    error_message = 'number of arguments (0 for 1, or more 3)'
#  #    @res = "CLIENT_ERROR #{error_message}"
#  #  else # if bool == 'off' && !time && cmds.empty?
#  #    # success
#  #    @res = res_list['routing.version_of_nodes'].gsub(/=>\d+/, '=>"DEACTIVATED"')
#  #  end
#  #else
#  #  error_message = 'argument 1: please input "on" or "off"'
#  #  @res = "CLIENT_ERROR #{error_message}"
#  #end
#end

###[DELETE action]============================================================================================================
# balse, shutdown, shutdown_self, (rbalse)
delete '/' do
  if res = Roma::FinishCommand.new.list[params[:command]]
    @res = res
  else
    raise TryRomaAPINoCommandError.new(params[:command])
  end

  erb :stats
end

###[POST action]============================================================================================================
# set, add, delete, replace, append, prepend, cas, set_expt, incr, decr, delete
post '/' do
  cmd = params[:command]
  k = params[:key]
  exp = params[:exptime].to_i
  val_size = params[:bytes].to_i
  cas = params[:casid].to_i
  v = params[:value]
  digit = params[:digit].to_i

  if can_i_set?(cmd, k)
    case cmd
    when /^(set|add|replace|append|prepend)$/
      set_data(cmd, k, v, exp, val_size)
      @res = "STORED"

    when /^set_expt$/
      set_data(cmd, k, request.cookies[k], exp)
      @res = "STORED"

    when /^(cas)$/
      h = revert_hash_from_string(request.cookies[k])
      if cas == h['clk']
        set_data(cmd, k, v, exp, val_size)
        @res = "STORED"
      else
        @res = "EXISTS"
      end

    when /^(incr|decr)$/
      if !digit.kind_of?(Integer)
        if digit =~ /^(\d+).+/
          digit = $1
        else
          digit = 0
        end
      end
      digit = -digit if $1 == 'decr'

      h = revert_hash_from_string(request.cookies[k])
      if h['value'].kind_of?(Integer)
        sum = h['value'] + digit
      else
        sum = digit
      end
      sum = 0 if sum < 0

      set_data(cmd, k, {'value' => sum, 'clk' => h['clk'] + 1})
      @res = sum

    when /^(delete)$/
      if request.cookies[k]
        response.delete_cookie k
        @res = "DELETED"
      else
        @res = "NOT_FOUND"
      end
    end

  else
    @res = "NOT_STORED" if cmd =~ /(add|replace|append|prepend)$/
    @res = "NOT_FOUND" if cmd =~ /^(delete|incr|decr|cas)$/
  end

  erb :stats
end

###[PUT action]============================================================================================================
put '/' do
  cmd = params[:command]
  case cmd
  when 'release'
    logger.info 'release process has been started.'
    #stat = Roma::Stat.new
    #res_list = stat.list

    #stat_list = session[:stat]

    #session['stats.run_release'] = 'true'
    #@@flag[:release] = true

    #@@routing_primary = res_list['routing.primary'].to_i
    #@@routing_secondary1 = res_list['routing.secondary1'].to_i
    #@@routing_secondary2 = res_list['routing.secondary2'].to_i

    session[:stat].list['stats.run_release'] = true

    run_pri = true

    Thread.new do
      begin
        loop{

          # decreasing
          if run_pri
            session[:stat].list['routing.primary'] -= 5
          end

          # check value
          if session[:stat].list['routing.primary'] <= 0
            session[:stat].list['routing.primary'] = 0
            run_pri = false
          end


          if !run_pri
            break
          else
            logger.info "primary: #{session[:stat].list['routing.primary']}"
          end

          sleep 2
        }
        
      rescue => e
        logger.info e
      ensure
        session[:stat].list['stats.run_release'] = false
        logger.info 'release processs has been finished.'
      end
    end

    @res = 'STRTED'
    erb :stats
  end
end








private

def search_key?(session, regexp)
  res = session.keys.grep(/#{regexp}/)
  res = nil if res.empty?
  res
end

def can_i_set?(command, key)
  if command =~ /^(add)$/
    return false if request.cookies[key]
  elsif command =~ /^(replace|append|prepend|cas|incr|decr|delete)$/
    return false unless request.cookies[key]
  elsif command =~ /^(set)$/
    return true
  end
  true
end

def set_data(cmd, key, value, exptime=(10 * 60), val_size=nil)

  exptime = check_exp_time(exptime) 

  if cmd =~ /^(set_expt|incr|decr)$/
    value_hash = value
  else
    value_hash = value_setting(cmd, key, value, val_size)
  end

  case cmd
  when /^(incr|decr)$/
    response.set_cookie(key, :value => value_hash)
  else
    response.set_cookie(key, :value => value_hash, :expires => exptime)
  end
  true
end

def check_exp_time(time)
  if time <= 0 || time > 10 * 60
    return Time.now + (10 * 60)
  else
    return Time.now + time
  end
end

def value_setting(cmd, k, v, val_size)
  if request.cookies[k]
    h = revert_hash_from_string(request.cookies[k])
    pre_v = h['value']
    pre_clk = h['clk']
  end

  case cmd
  when /^(set|add|replace|cas)$/
    value = v.slice(0, val_size)
  when 'append'
    value = pre_v.concat(v.slice(0, val_size))
  when 'prepend'
    value = pre_v.prepend(v.slice(0, val_size))
  end

  if pre_clk
    h = {'value' => value, 'clk' => pre_clk += 1 }
  else
    h =  {'value' => value, 'clk' => 0 }
  end

  return h 
end

def revert_hash_from_string(str)
  if !str.kind_of?(String)
    raise TryRomaAPINoMethodError.new("undefined method `#{__method__}' for '#{str}':#{str.class}")
  elsif str[0] != '{'
    raise TryRomaAPIUnexpectedStyleError.new("'#{str}' is NOT start from '{'")
  end

  str = str.chomp.gsub(/"|^{|}$/, '')
  str = str.split(/,[\s]*|=>/)
  str.each_with_index{|column, idx|
    str[idx] = column.to_i if column =~ /^\d+$/
  }

  Hash[*str]
end


=end
