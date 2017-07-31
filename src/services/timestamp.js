function Timestamp(){	

}

Timestamp.prototype.get = function() {
  var t = new Date();
  var timestamp = '';

  (t.getHours() > 9) ? (timestamp += t.getHours() + ':') : (timestamp += '0' + t.getHours() + ':');
  (t.getMinutes() > 9) ? (timestamp += t.getMinutes() + ':') : (timestamp += '0' + t.getMinutes() + ':');
  (t.getSeconds() > 9) ? (timestamp += t.getSeconds() + '.') : (timestamp += '0' + t.getSeconds() + '.');

   if(t.getMilliseconds() > 99)
       timestamp += t.getMilliseconds();
   else if(t.getMilliseconds() > 9)
       timestamp += '0' + t.getMilliseconds();
   else
       timestamp += '00' + t.getMilliseconds();

   return timestamp;
};

module.exports = Timestamp;