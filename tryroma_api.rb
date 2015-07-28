module TryRomaAPI
  require_relative 'version'
  require_relative './stat_initialize/config'
  require_relative './stat_initialize/stats'
  require_relative './stat_initialize/storage'
  require_relative './stat_initialize/write_behind'
  require_relative './stat_initialize/routing'
  require_relative './stat_initialize/connetion'
  require_relative './command_list/balse'

  class TryRomaAPIError < StandardError; end
  class TryRomaAPINoCommandError < TryRomaAPIError; end
  class TryRomaAPINoMethodError < TryRomaAPIError; end
  class TryRomaAPIUnexpectedStyleError < TryRomaAPIError; end
  class TryRomaAPIArgumentError < TryRomaAPIError; end
end
