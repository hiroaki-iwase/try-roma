class Roma
  class Stat
    attr_accessor :list

    def initialize()
      @list = Hash.new
      @list = {
        "stats.run_release" => "false",
        "routing.redundant" => "3",
        "routing.nodes.length" => "4",
        "routing.nodes" => '["localhost_10001", "localhost_10002", "localhost_10003", "localhost_10004"]',
        "routing.primary" => 152,
        "routing.secondary1" => "106",
        "routing.secondary2" => "133",
        "routing.short_vnodes" => "0",
        "routing.lost_vnodes" => "0",
        "routing.version_of_nodes" => '{"localhost_10001"=>66048, "localhost_10002"=>66048, "localhost_10003"=>66048, "localhost_10004"=>66048}',
      }
    end
  end # End of Stat
end # End of Roma
