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
  # response of stat command
  session[:version]      = Roma::Version.new      unless session[:version]
  session[:config]       = Roma::Config.new       unless session[:config]
  session[:stats]        = Roma::Stats.new        unless session[:stats]
  session[:storage]      = Roma::Storage.new      unless session[:storage]
  session[:write_behind] = Roma::WriteBehind.new  unless session[:write_behind]
  session[:routing]      = Roma::Routing.new      unless session[:routing]
  session[:connection]   = Roma::Connection.new   unless session[:connetion]
  session[:others]       = Roma::Others.new       unless session[:others]

  # others
  
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
  #{session[:stats]}<br>
  #{session[:stats].class}<br>
  #{session[:stats].get_stat.class}<br>
  #{session[:stats].get_stat.size}<br>
  #{session[:stats].get_stat}<br>
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
  all_list = session[:version].get_stat\
           .merge(session[:config].get_stat)\
           .merge(session[:stats].get_stat)\
           .merge(session[:storage].get_stat)\
           .merge(session[:write_behind].get_stat)\
           .merge(session[:routing].get_stat)\
           .merge(session[:connection].get_stat)\
           .merge(session[:others].get_stat)
 
  @res = all_list.select{|k, v| k =~ /#{regexp}/}
  erb :stats
end

# whoami/nodelist/version
get %r{^/(whoami|nodelist|version)$} do |cmd|
  case cmd
  when 'whoami'
    @res = session[:stats].get_stat['stats.name']
  when 'nodelist'
    @res = session[:routing].get_stat['routing.nodes'].join(' ')
  when 'version'
    @res = "VERSION ROMA-#{session[:version].get_stat['version']}"
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


=begin


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
=end

###[DELETE]============================================================================================================
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
    if can_i_release?(session[:stats].run_release, session[:routing])
      logger.info 'release process has been started.'
      session[:stats].run_release = true

      run_pri = true
      run_sec1 = true
      run_sec2 = true
      Thread.new do
        begin
          loop{
            # decreasing
            session[:routing].primary -= 5 if run_pri
            session[:routing].secondary1 -= 5 if run_sec1
            session[:routing].secondary2 -= 5 if run_sec2

            # check value
            if session[:routing].primary <= 0
              session[:routing].primary = 0
              run_pri = false
            end
            if session[:routing].secondary1 <= 0
              session[:routing].secondary1 = 0
              run_sec1 = false
            end
            if session[:routing].secondary2 <= 0
              session[:routing].secondary2 = 0
              run_sec2 = false
            end

            # debug
            if run_pri || run_sec1 || run_sec2
              logger.info "primary:    #{session[:routing].primary}" 
              logger.info "secondary1: #{session[:routing].secondary1}"
              logger.info "secondary2: #{session[:routing].secondary2}"
            end
            break if !run_pri && !run_sec1 && !run_sec2

            sleep 2
          }
         
        rescue => e
          logger.info e
        ensure
          session[:stats].run_release = false
          logger.info 'release processs has been finished.'
        end
      end
      @res = 'STRTED'
    else
      @res = "release:Sufficient nodes do not found."
    end

    erb :stats

  when 'recover'
    if can_i_recover?(session[:stats].run_recover, session[:routing])

      logger.info 'recover process has been starteda.'
      session[:stats].run_recover = true

      run_short = true
      Thread.new do
        begin
          loop{
            # decreasing
            session[:routing].short_vnodes -= 5 if run_short

            # check value
            if session[:routing].short_vnodes <= 0
              session[:routing].short_vnodes = 0
              run_short = false
            end

            # debug
            if run_short
              logger.info "short_vnodes:    #{session[:routing].short_vnodes}" 
            end
            break if !run_short

            sleep 2
          }
         
        rescue => e
          logger.info e
        ensure
          session[:stats].run_recover = false
          logger.info 'recover processs has been finished.'
        end
      end
      node_list = session[:routing].version_of_nodes
      node_list.each{|k, v|
        node_list[k] = 'STARTED'
      }
      @res = node_list
    end

    erb :stats

  when 'set_auto_recover'
    bool = params[:bool]
    session[:routing].auto_recover = bool.to_boolean

    sec = params[:sec]
    unless sec.empty?
      raise TryRomaAPIArgumentError if sec !~ /^\d+$/
      session[:routing].auto_recover_time = sec.to_i
    end

    node_list = session[:routing].version_of_nodes
    node_list.each{|k, v|
      node_list[k] = 'STORED'
    }
    @res = node_list

    erb :stats

  when 'set_lost_action'
    action = params[:lost]

    if session[:routing].lost_action !~ /^(auto_assign|shutdown)$/
      @res = 'CLIENT_ERROR can use this command only current lost action is auto_assign or shutdwn mode'
    else
      if action !~ /^(auto_assign|shutdown)$/
        @res = 'CLIENT_ERROR changing lost_action must be auto_assign or shutdown' if action !~ /^(auto_assign|shutdown)$/
      else
        session[:routing].lost_action = action

        node_list = session[:routing].version_of_nodes
        node_list.each{|k, v|
          node_list[k] = 'STORED'
        }
        @res = node_list
      end
    end

    erb :stats

  else
    raise TryRomaAPINoCommandError.new(params[:command])
  end
end






private

class String
  def to_boolean
    return "ERROR: #{self} is already Bool type" if self.class.kind_of?(TrueClass) || self.class.kind_of?(FalseClass)

    if self =~ /^(true|false)$/
      return true if $1 == 'true'
      return false if $1 == 'false'
    else
      return "ERROR: #{self} is Unexpected Style."
    end
  end
end

def can_i_recover?(run_recover, routing_stat)

  if run_recover
    @res = 'SERVER_ERROR Recover process is already running.'
    return false
  elsif routing_stat.nodes.length < routing_stat.redundant
    @res = 'SERVER_ERROR nodes num < redundant num'
    return false
  end

  true
end

def can_i_release?(run_release, routing_stat)
  if run_release || (routing_stat.nodes.length <= routing_stat.redundant)
    return false
  end

  true
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

