
const Log = nodeRequire('./src/controllers/log.js')

function Trace(){
    /**
     * [dump description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    this.dump = function (data){
        var dump = '';
        var hex_line = '';
        var ascii_line = '';
        var padding  = '        ';

        for (var i in data) {
            var charcode = data.charCodeAt(i);
            (charcode >= 16) ? (hex_line += charcode.toString(16) + ' ') : (hex_line += '0' + charcode.toString(16) + ' ');
            (charcode >= 32 && charcode <= 126) ? (ascii_line += data[i]) : (ascii_line += '.');

            if(i % 16 === 15){  
                dump = dump + '\t' + hex_line + padding + ascii_line + '\n';
                hex_line = '';
                ascii_line = '';
            }
        };

        if (hex_line){
            for (i = 0; i < (16 - ascii_line.length); i++)
                padding += '   ';
            dump = dump + '\t' + hex_line + padding + ascii_line;
        }

        return dump;
    };

    /**
     * [getTimestamp description]
     * @return {[type]} [description]
     */
    this.getTimestamp = function() {
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

    this.log = new Log();
};

/**
 * [trace description]
 * @param  {[type]} data  [description]
 * @param  {[type]} title [description]
 * @return {[type]}       [description]
 */
Trace.prototype.trace = function(data, title){  
  var trace = '\n' + this.getTimestamp()
  if (title)
    trace += title + '\n' + this.dump(data.toString('binary'));
  else
    trace += '\n' + this.dump(data.toString('binary'));
      
  this.log.log(trace);
};

/**
 * [object display the fields of javascript object]
 * @param  {[type]} data  [object to display]
 * @return {[type]}       [description]
 */
Trace.prototype.object = function(data){
    var dump = '\n';

    var maxLen = 0;
    for (var property in data)
        if (property.length > maxLen)
            maxLen = property.length

    for (var property in data) {
        var property_name = property;
        while(property_name.length < maxLen)
            property_name += ' ';
        dump += '\t[' + property_name + ']: [' + data[property].toString().replace(/[^\x20-\x7E]+/g, '.') + ']\n'; 
    }
    return dump;
};

module.exports = Trace
