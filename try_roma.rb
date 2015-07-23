require 'sinatra'
require_relative 'tryroma_api'
require_relative 'stat'
require_relative 'balse'
#require_relative 'post_cmd'
include TryRomaAPI

configure do
end

# debug 
get '/' do

  erb :stats
end

# stat/stats [regexp]
get %r{/stat[s]*/?(.*)?} do |regexp|
  stat = Roma::Stat.new

  res_list = stat.list
  if regexp
    @res = res_list.select{|k, v| k =~ /#{regexp}/}
  else
    @res = res_list
  end
  erb :stats
end

# get/gets <key>
get %r{/(get[s]*)/(.*)}  do |i, k|
  if request.cookies[k]
    h = revert_hash_from_string(request.cookies[k])
    value = h['value']
    clk   = h['clk'] if i == 'gets'
    logger.info "clk = #{clk}"

    @res = "VALUE #{k} 0 #{value.size} #{clk}<br>#{value}<br>END<br>"
  else
    @res = "END<br>"
  end

  erb :stats
end

# balse, shutdown, shutdown_self, (rbalse)
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

# set, add, delete, replace, append, prepend, cas, set_expt, incr, decr, delete
post '/' do
  cmd = params[:command]
  k = params[:key]
  exp = params[:exptime].to_i
  val_size = params[:bytes].to_i
  cas = params[:casid].to_i
  v = params[:value]
  digit = params[:digit].to_i

  case cmd
  when /^(set|add|replace|append|prepend)$/
    if can_i_set?($1, k)
      exptime = check_exp_time(exp)

      value_hash = value_setting($1, k, v, val_size)
      response.set_cookie(k, :value => value_hash, :expires => exptime)

      @res = "STORED"
    else
      @res = "NOT_STORED"
    end
  when /^set_expt$/
    if request.cookies[k]
      exptime = check_exp_time(exp)
      response.set_cookie(k, :value => request.cookies[k], :expires => exptime)
      @res = "STORED"
    else
      @res = "NOT_STORED"
    end
  when /^(cas)$/
    if request.cookies[k]
      h = revert_hash_from_string(request.cookies[k])
      if cas == h['clk']
        exptime = check_exp_time(exp)
        value_hash = value_setting($1, k, v, val_size)
        response.set_cookie(k, :value => value_hash, :expires => exptime)
        @res = "STORED"
      else
        @res = "EXISTS"
      end
    else
      @res = "NOT_FOUND"
    end
  when /^(incr|decr)$/
    if request.cookies[k]
      h = revert_hash_from_string(request.cookies[k])

      digit = -digit if $1 == 'decr'
      if !digit.kind_of?(Integer)
        if digit =~ /^(\d+).+/
          digit = $1
        else
          digit = 0
        end
      end

      if h['value'].kind_of?(Integer)  
        sum = h['value'] + digit
      else
        sum = digit
      end
      sum = 0 if sum < 0
      response.set_cookie(k, :value => {'value' => sum, 'clk' => h['clk'] + 1})
      @res = sum
    else
      @res = "NOT_FOUND"
    end
  when /^(delete)$/
    if request.cookies[k]
      response.delete_cookie k
      @res = "DELETED"
    else
      @res = "NOT_FOUND"
    end
  end

  erb :stats
end

private

# set_data(:set)
#def set_data(:method)
#end

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


def can_i_set?(command, key)
  if command =~ /^(add)$/
    return false if request.cookies[key]
  elsif command =~ /^(replace|append|prepend)$/
    return false unless request.cookies[key]
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

def revert_hash_from_string(str)
  if str[0] != '{'
    raise TryRomaAPIError "Unexpected style : #{str}"
  end

  str = str.chomp.gsub(/"|^{|}$/, '')
  str = str.split(/,[\s]*|=>/)
  str.each_with_index{|column, idx|
    str[idx] = column.to_i if column =~ /^\d+$/
  }

  Hash[*str]
end

