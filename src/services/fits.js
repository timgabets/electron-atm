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


  /**
   * [leftpad padd the string with zeroes from left]
   * @param  {[type]} string [description]
   * @return {[type]}        [description]
   */
  this.leftpad = function(string){
    if(string.length % 3 === 1)
      return '00' + string;
    else if (string.length % 3 === 2)
      return '0' + string;
    else 
      return string
  }


  /**
   * [decimal2hex convert decimal string to hex string. 
   * The FIT data is sent to the terminal in decimal, so
   * to construct the FIT Data load message, each digit triplet must be
   * converted from decimal to hex, producing a two‐character string
   * in the range 00‐FF.]
   * @param  {[type]} decimal [decimal string received in the FIT message from host, e.g. 065 136 037 255 255]
   * @return {[type]}         [hex string representation, e.g. 41 88 25 FF FF]
   */
  this.decimal2hex = function(decimal){
    var padded = this.leftpad(decimal)
    var hex = '';
    
    for (var i = padded.length - 3; i >= 0; i -= 3)
      hex = this.d2h(padded.substr(i, 3)).concat(hex);

    return hex;
  }

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
