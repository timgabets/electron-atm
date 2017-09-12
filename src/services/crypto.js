const Pinblock = require('../controllers/pinblock.js');
const des3 = require('node-cardcrypto').des;

function CryptoService(settings, log){
  /**
   * [setMasterKey description]
   * @param {[type]} key [description]
   */
  this.setMasterKey = function(key){
    this.keys.master_key.key = key;
    settings.set('master_key', key);
  };

    /**
   * [setTerminalKey description]
   * @param {[type]} key [description]
   */
  this.setTerminalKey = function(key){
    this.keys.pin_key.key = key;
    settings.set('pin_key', key);
  };


  /**
   * [getKeyCheckValue description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  this.getKeyCheckValue = function(key){
    var kcv = des3.ecb_encrypt(key, '00000000000000000000000000000000');
    if(kcv)
      return kcv.substr(0, 6);
    else
      return null;
  }

  /**
   * [getTerminalKey description]
   * @return {[type]} [description]
   */
  this.getTerminalKey = function(){
    return [this.keys.pin_key.key, this.getKeyCheckValue(this.keys.pin_key.key)];
  };


  /**
   * [getMasterKey description]
   * @return {[type]} [description]
   */
  this.getMasterKey = function(){
    return [this.keys.master_key.key, this.getKeyCheckValue(this.keys.master_key.key)] ;
  };



  /**
   * [dec2hex convert decimal string to hex string, e.g. 040198145193087203201076202216192211251240251237 to 28C691C157CBC94CCAD8C0D3FBF0FBED]
   * @param  {[type]} dec_string [decimal string ]
   * @return {[type]}            [hex string]
   */
  this.dec2hex = function (dec_string){
    var hex_string = '';
    for(var i = 0; i < dec_string.length; i += 3){
      var chunk = parseInt(dec_string.substr(i, 3)).toString(16);
      (chunk.length === 1) ? (hex_string = hex_string + '0' + chunk ) : hex_string += chunk;
    }

    return hex_string.toUpperCase();
  }

  /**
   * [setCommsKey description]
   * @param {[type]} key_decimal [description]
   * @param {[type]} length      [description]
   */
  this.setCommsKey = function(key_decimal, length){
    var comms_key = this.dec2hex(key_decimal);
    var expected_key_length = parseInt(length, 16) / 1.5;

    if(comms_key.length !== expected_key_length)
    {
      log.error('Key length mismatch. New key has length ' + comms_key.length + ', but expected length is ' + expected_key_length);
      return false;
    }

    log.info('New comms key received: ' + comms_key);
    if(!this.keys.master_key.key)
    {
      log.error('Invalid master key: ' + this.keys.master_key.key);
      return false;
    }

    this.keys.pin_key.key = des3.ecb_decrypt(this.keys.master_key.key, comms_key);
    log.info('New comms key value: ' + this.keys.pin_key.key);
    settings.set('pin_key', this.keys.pin_key.key);
    return true;
  };

  /**
   * [getEncryptedPIN description]
   * @return {[type]}           [description]
   */
  this.getEncryptedPIN = function(PIN_buffer, card_number){
    if(this.keys.pin_key.key){
      log.info('Clear PIN block:     [' + this.pinblock.get(PIN_buffer, card_number) + ']')

      var encrypted_pinblock = des3.ecb_encrypt(this.getTerminalKey()[0], this.pinblock.get(PIN_buffer, card_number));
      log.info('Encrypted PIN block: [' + encrypted_pinblock + ']');

      var atm_pinblock = this.pinblock.encode_to_atm_format(encrypted_pinblock);
      log.info('Formatted PIN block: [' + atm_pinblock + ']');
      
      return atm_pinblock;
    } else
    {
      log.error('Terminal key is not set, unable to encrypt PIN block');
      return null;
    }
  };

  this.pinblock = new Pinblock();

  this.keys = {
    master_key: {
      key: '', 
      check_value: ''},
    pin_key: {
      key: '', 
      check_value: ''}
  };

  (settings.get('master_key')) ? this.setMasterKey(settings.get('master_key')) : this.setMasterKey('4BA59DC607B13AF49F3CD22CB2FDA11E');
  (settings.get('pin_key')) ? this.setTerminalKey(settings.get('pin_key')) : this.setTerminalKey('1E9CA58EBE65FF4B6F339393142DA096');
};

module.exports = CryptoService;
