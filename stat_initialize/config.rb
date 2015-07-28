module Roma
  class Config

    def initialize
    end

    def get_stat
      ret = {}
      ret["DEFAULT_LOST_ACTION"] = 'auto_assign'
      ret["LOG_SHIFT_AGE"] = 10
      ret["LOG_SHIFT_SIZE"] = 10485760
      ret["LOG_PATH"] = '/home/roma/app/logs'
      ret["RTTABLE_PATH"] = '/home/roma/app/routing'
      ret["STORAGE_DELMARK_EXPTIME"] = 432000
      ret["STORAGE_EXCEPTION_ACTION"] = 'no_action'
      ret["DATACOPY_STREAM_COPY_WAIT_PARAM"] = 0.001
      ret["PLUGIN_FILES"] = ["plugin_storage.rb", "plugin_mapcount.rb", "plugin_gui.rb", "plugin_cmd_aliases.rb", "plugin_test.rb", "plugin_map.rb", "plugin_alist.rb", "plugin_debug.rb"]
      ret["WRITEBEHIND_PATH"] = '/home/roma/app/wb'
      ret["WRITEBEHIND_SHIFT_SIZE"] = 10485760
      ret["config.CONNECTION_DESCRIPTOR_TABLE_SIZE"] = 4096
      ret
    end

  end # End of class Config
end # End of module Roma 
