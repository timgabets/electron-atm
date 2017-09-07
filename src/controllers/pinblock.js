const xor = require('node-cardcrypto').xor;

function Pinblock(){
  this.get = function(pin, cardnumber){
    // A 16-digit block is made from the digit 0, the length of the PIN, the PIN, and a pad
    // character (hexadecimal F). For example, for the 5-digit PIN 92389, the block is: 0592 389F FFFF FFFF
    var block1 = '0' + pin.length.toString() + pin;
    while(block1.length < 16)
      block1 += 'F';

    // Another 16-digit block is made from four zeros and the 12 right-most digits of the
    // account number, excluding the check digit. For example, for the 13-digit account number
    // 4000 0012 3456 2, where the check digit is 2, the block is: 0000 4000 0012 3456
    var block2 = '0000' + cardnumber.substr(cardnumber.length - 12 - 1, 12);

    return xor(block1, block2);
  };

  /**
   * [encode_to_atm_format description]
   * @param  {[type]} pinblock [description]
   * @return {[type]}          [description]
   */
  this.encode_to_atm_format = function(pinblock){
    var atm_pinblock = '';

    for (var i = 0; i < pinblock.length; i++){
      switch(pinblock[i]){
        case 'A':
          atm_pinblock += ':'
          break;

        case 'B':
          atm_pinblock += ';'
          break;

        case 'C':
          atm_pinblock += '<'
          break;

        case 'D':
          atm_pinblock += '='
          break;

        case 'E':
          atm_pinblock += '>'
          break;

        case 'F':
          atm_pinblock += '?'
          break;
        
        default:
          atm_pinblock += pinblock[i];
          break;
      }
    }

    return atm_pinblock;
  };


  this.decode_from_atm_format = function(atm_pinblock){
    var pinblock = '';
    for (var i = 0; i < atm_pinblock.length; i++){
      switch(atm_pinblock[i]){
        case ':':
          pinblock += 'A'
          break;

        case ';':
          pinblock += 'B'
          break;

        case '<':
          pinblock += 'C'
          break;

        case '=':
          pinblock += 'D'
          break;

        case '>':
          pinblock += 'E'
          break;

        case '?':
          pinblock += 'F'
          break;
        
        default:
          pinblock += atm_pinblock[i];
          break;
      }
    }

    return pinblock;
  }
}

module.exports = Pinblock;
