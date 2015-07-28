module Roma
  class Storage

    def initialize
    end

    def get_stat
      ret = {}
      ret['storage.storage_path'] = '/home/roma/app/ds/localhost_10001/roma'
      ret['storage.st_class'] = 'TCStorage'
      ret['storage.divnum'] = 10
      ret['storage.option'] = 'bnum=5000000#xmsiz=16106127#opts=d#dfunit=10'
      ret['storage.each_vn_dump_sleep'] = 0.001
      ret['storage.each_vn_dump_sleep_count'] = 100
      ret['storage.each_vn_dump_files'] = nil
      ret['storage.each_clean_up_sleep'] = 0.01
      ret['storage.cleanup_regexp'] = nil
      ret['storage.logic_clock_expire'] = 300
      ret['storage.safecopy_stats'] = [:normal, :normal, :normal, :normal, :normal, :normal, :normal, :normal, :normal, :normal]
      ret['storage[0].path'] = '/home/roma/app/ds/localhost_10001/roma/0.tc'
      ret['storage[0].rnum'] = 0
      ret['storage[0].fsiz'] = 20975936
      ret['storage[1].path'] = '/home/roma/app/ds/localhost_10001/roma/1.tc'
      ret['storage[1].rnum'] = 0
      ret['storage[1].fsiz'] = 20975936
      ret['storage[2].path'] = '/home/roma/app/ds/localhost_10001/roma/2.tc'
      ret['storage[2].rnum'] = 0
      ret['storage[2].fsiz'] = 20975936
      ret['storage[3].path'] = '/home/roma/app/ds/localhost_10001/roma/3.tc'
      ret['storage[3].rnum'] = 0
      ret['storage[3].fsiz'] = 20975936
      ret['storage[4].path'] = '/home/roma/app/ds/localhost_10001/roma/4.tc'
      ret['storage[4].rnum'] = 0
      ret['storage[4].fsiz'] = 20975936
      ret['storage[5].path'] = '/home/roma/app/ds/localhost_10001/roma/5.tc'
      ret['storage[5].rnum'] = 0
      ret['storage[5].fsiz'] = 20975936
      ret['storage[6].path'] = '/home/roma/app/ds/localhost_10001/roma/6.tc'
      ret['storage[6].rnum'] = 0
      ret['storage[6].fsiz'] = 20975936
      ret['storage[7].path'] = '/home/roma/app/ds/localhost_10001/roma/7.tc'
      ret['storage[7].rnum'] = 0
      ret['storage[7].fsiz'] = 20975936
      ret['storage[8].path'] = '/home/roma/app/ds/localhost_10001/roma/8.tc'
      ret['storage[8].rnum'] = 0
      ret['storage[8].fsiz'] = 20975936
      ret['storage[9].path'] = '/home/roma/app/ds/localhost_10001/roma/9.tc'
      ret['storage[9].rnum'] = 0
      ret['storage[9].fsiz'] = 20975936
      ret
    end

  end # End of class Storage
end # End of module Roma 
