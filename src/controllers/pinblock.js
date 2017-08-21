const xor = require('node-cardcrypto').xor;

function Pinblock(){
  this.get = function(pin, cardnumber){
    // A 16-digit block is made from the digit 0, the length of the PIN, the PIN, and a pad
    // character (hexadecimal F). For example, for the 5-digit PIN 92389, the block is: 0592 389F FFFF FFFF
    var block1 = '0' + pin.length.toString() + pin;
    while(block1.length < 16)
      block1 += 'F'

    // Another 16-digit block is made from four zeros and the 12 right-most digits of the
    // account number, excluding the check digit. For example, for the 13-digit account number
    // 4000 0012 3456 2, where the check digit is 2, the block is: 0000 4000 0012 3456
    var block2 = '0000' + cardnumber.substr(cardnumber.length - 12 - 1, 12);

    return xor(block1, block2);
  }
}

module.exports = Pinblock;
