module Roma
  class Routing

      attr_accessor :redundaunt
      attr_accessor :nodes
      attr_accessor :lost_action
      attr_accessor :auto_recover
      attr_accessor :auto_recover_status
      attr_accessor :auto_recover_time
      attr_accessor :event
      attr_accessor :version_of_nodes

      def initialize
        @redundant = 3
        @nodes = ["192.168.33.12_10001", "192.168.33.12_10002", "192.168.33.12_10003", "192.168.33.12_10004"]
        @lost_action=:no_action
        @auto_recover=false
        @auto_recover_status="waiting"
        @auto_recover_time=1800
        @event = []
        @version_of_nodes = {"192.168.33.12_10001"=>66048, "192.168.33.12_10002"=>66048, "192.168.33.12_10003"=>66048, "192.168.33.12_10004"=>66048}
      end

      def get_stat()
        ret = {}
        ret['routing.redundant'] = 3
        ret['routing.nodes.length'] = @nodes.length 
        ret['routing.nodes'] = @nodes
        ret['routing.dgst_bits'] = 32
        ret['routing.div_bits'] = 9
        ret['routing.vnodes.length'] = 512
        ret['routing.primary'] = @primary
        ret['routing.secondary1'] = @secondary1
        ret['routing.secondary2'] = @secondary2
        ret['routing.short_vnodes'] = @short_vnodes
        ret['routing.lost_vnodes'] = @lost_vnodes
        ret['routing.fail_cnt_threshold'] = 15
        ret['routing.fail_cnt_gap'] = 0
        ret['routing.sub_nid'] = {}
        ret['routing.lost_action'] = @lost_action
        ret['routing.auto_recover'] = @auto_recover
        ret['routing.auto_recover_status'] = @auto_recover_status
        ret['routing.auto_recover_time'] = @auto_recover_time
        ret['routing.event'] = @event
        ret['routing.event_limit_line'] = 1000
        ret['routing.version_of_nodes'] = @version_of_nodes
        ret['routing.min_version'] = 66048
        ret['routing.enabled_failover'] = true
        ret
      end

  end # End of class Routing
end # End of module Roma 
