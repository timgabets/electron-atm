
const Log = require('./log.js')
const Timestamp = require('../services/timestamp.js')

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

    this.log = new Log();
    this.timestamp = new Timestamp();
};

/**
 * [trace description]
 * @param  {[type]} data  [description]
 * @param  {[type]} title [description]
 * @return {[type]}       [description]
 */
Trace.prototype.trace = function(data, title){  
  var trace = this.timestamp.get();
  if (title)
    trace += title + '\n' + this.dump(data.toString('binary'));
  else
    trace += '\n' + this.dump(data.toString('binary'));
      
  this.log.info(trace);
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
