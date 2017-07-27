const Trace = require('../controllers/trace.js');

function FITsService(settings, log){
  this.trace = new Trace();
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
    if(!data){
      log.log('FITsService.parseFIT(): empty data');
      return false;
    }
  
    var i = 0;
    var field_length = 0;

    // Insitution ID index
    field_length = 1.5 * 2; // The field in NDC manual is referred as '2 Digits', assuming 2 hex digits, which is 3 decimal digits. 
    parsed.PIDDX = data.substr(i, field_length);
    i += field_length + 3;
  
    // Institution ID
    field_length = 1.5 * 10; // 10 digits
    parsed.PFIID = this.decimal2hex(data.substr(i, field_length));
    i += field_length;

    // PSTDX (Indirect Next State Index)
    field_length = 1.5 * 2;
    parsed.PSTDX = this.decimal2hex(data.substr(i, field_length));
    i += field_length;
    
    /*
    TODO:
    
    // PAGDX (Algorithm/Bank ID Index)
    parsed.PAGDX = this.decimal2hex(data.substr(i, field_length));
    i += field_length;

    // PMXPN (Maximum PIN Digits Entered) - Maximum number of PIN digits allowed for the cardholder to enter
    parsed.PMXPN = this.decimal2hex(data.substr(i, field_length))
    i += field_length;

    // PCKLN (Maximum PIN Digits Checked) - Number of digits used for local PIN check
    parsed.PCKLN = this.decimal2hex(data.substr(i, field_length))
    i += field_length;

    // PINPD (PIN Pad) - Character used to pad PIN for transmission to the host and the encryption method used
    parsed.PINPD = this.decimal2hex(data.substr(i, field_length))
    i += field_length;
    
    // PANDX (PAN Data Index) - Index for location of PAN (Personal Account Number) on card
    parsed.PANDX = this.decimal2hex(data.substr(i, field_length))
    i += field_length;
    */
    return parsed;
  }

  /**
   * [addFIT description]
   * @param {[type]} FIT [description]
   * @return {boolean}     [true if state was successfully added, false otherwise]
   */
  this.addFIT = function(FIT){
    var parsed = this.parseFIT(FIT);
    if(parsed){
      this.FITs[parsed.PIDDX] = parsed;
      log.log('\tFIT ' + parsed.PIDDX + ' processed (FITs overall: ' + Object.keys(this.FITs).length + '):' + this.trace.object(parsed));
      settings.set('FITs', this.FITs);
      return true;
    }
    else{
      log.log('FITsService.addFIT(): not added');
      return false;
    }
  };


  /**
   * [matchCardnumberWithMask match card number with a wildcard hexadecimal mask]
   * @param  {[type]} cardnumber [16-character card number]
   * @param  {[type]} mask       [10-character BIN mask, e.g. 418825FFFF]
   * @return {[type]}            [true if there is a match, false otherwise]
   */
  this.matchCardnumberWithMask = function(cardnumber, mask){
    for(var i = 0; i < mask.length; i++){
      if( (parseInt(cardnumber[i]) & parseInt(mask[i], 16)).toString() != cardnumber[i]){
        return false;
      }
    }
    return true;
  }


  /**
   * [getInstitutionByCardnumber description]
   * @param  {[type]} cardnumber [cardnumber to check]
   * @return {[type]}            [Matched FIT institution ID or undefined if no FIT found]
   */
  this.getInstitutionByCardnumber = function(cardnumber){
    var BreakException = {};
    var matched_institution = Number.MAX_VALUE;

    for (var item in this.FITs)
      if(this.matchCardnumberWithMask(cardnumber, this.FITs[item].PFIID) && matched_institution > this.FITs[item].PIDDX)
        matched_institution = this.FITs[item].PIDDX;
    
    if (matched_institution !== Number.MAX_VALUE)
      return matched_institution
  };
}

/**
 * [add description]
 * @param {[type]} data [array of data to add]
 * @return {boolean}     [true if data were successfully added, false otherwise]
 */
FITsService.prototype.add = function(data){
  if(typeof data === 'object') {
    for (var i = 0; i < data.length; i++){
      if(!this.addFIT(data[i])){
        log.log('Error processing FIT ' + data[i] );
        return false;
      }
    }
    return true;
  } else if (typeof data === 'string') {
    return this.addFIT(data); 
  } 
};

module.exports = FITsService
