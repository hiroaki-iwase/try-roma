module TryRomaAPI
  require_relative 'version'
  require_relative 'stat'
  require_relative 'balse'

  class TryRomaAPIError < StandardError; end
  class TryRomaAPINoCommandError < TryRomaAPIError; end
  class TryRomaAPINoMethodError < TryRomaAPIError; end
  class TryRomaAPIUnexpectedStyleError < TryRomaAPIError; end
  class TryRomaAPIArgumentError < TryRomaAPIError; end
end
