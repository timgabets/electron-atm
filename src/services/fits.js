const Trace = require('../controllers/trace.js');

function FITsService(settings, log){
  this.FITs = settings.get('FITs');
  if(!this.FITs)
    this.FITs = {};  

  /**
   * [d2h convert decimal string to hex string]
   * @param  {[type]} d [decimal from 0 to 255]
   * @return {[type]}   [hex string, padded with zeroes]
   */
  this.d2h = function(d) { 
    if(d < 10)
      return '0' + (+d).toString(16).toUpperCase();
    else
      return (+d).toString(16).toUpperCase();
  };

  this.parseFIT = function(data){
    var parsed = {};
    if(!data)
      return false;

  
    var i = 0;
    var field_length = 0;

    // Insitution ID index
    field_length = 3;
    parsed.PIDDX = this.d2h(data.substr(i, field_length));
    i += field_length;
  
/*
    // Institution ID
    field_length = 10;
    parsed.PFIID = this.d2h(data.substr(i, field_length));
    i += field_length;

    // PSTDX (Indirect Next State Index)
    field_length = 2;
    parsed.PSTDX = data.substr(i, field_length);
    i += field_length;

    // PAGDX (Algorithm/Bank ID Index)
    parsed.PAGDX = data.substr(i, field_length);
    i += field_length;

    // PMXPN (Maximum PIN Digits Entered)
    parsed.PMXPN = data.substr(i, field_length);
    i += field_length;
*/
    return parsed;
  }

}

module.exports = FITsService
