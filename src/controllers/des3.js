const des = require('node-cardcrypto').des;

function DES3(){
  this.encrypt = function(key, msg){
    if( key.length !== 32) {
      throw Error('Key length ' + key.length + ' is invalid. Only double keys supported (length 16)');
    }
 
    result = des.ecb_encrypt(key, msg);

    return result;
  }

  this.decrypt = function(key, msg){
    if( key.length !== 32) {
      throw Error('Key length ' + key.length + ' is invalid. Only double keys supported (length 16)');
    }
    
    var keyLeft = key.substr(0, 16);
    var keyRight = key.substr(16, 32);

    var data = msg;
    data = des.ecb_encrypt(keyLeft, data);
    data = des.ecb_decrypt(keyRight, data);
    data = des.ecb_encrypt(keyLeft, data);
 
    result = des.ecb_decrypt(key, msg);

    return result;
  }
}

module.exports = DES3;