const Pinblock = require('pinblock');
const des3 = require('node-cardcrypto').des;

class CryptoService {
  constructor(settings, log){
    this.settings = settings;
    this.log = log;
    this.pinblock = new Pinblock();
  
    this.keys = {
      master_key: {
        key: '', 
        check_value: ''},
      pin_key: {
        key: '', 
        check_value: ''}
    };

    (settings.get('master_key')) ? this.setMasterKey(settings.get('master_key')) : this.setMasterKey('');
    (settings.get('pin_key')) ? this.setTerminalKey(settings.get('pin_key')) : this.setTerminalKey('');
  }
  
  /**
   * [setMasterKey description]
   * @param {[type]} key [description]
   */
  setMasterKey(key){
    this.keys.master_key.key = key;
    this.settings.set('master_key', key);
  }

  /**
   * [setTerminalKey description]
   * @param {[type]} key [description]
   */
  setTerminalKey(key){
    this.keys.pin_key.key = key;
    this.settings.set('pin_key', key);
  }

  /**
   * [getKeyCheckValue description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getKeyCheckValue(key){
    let kcv = des3.ecb_encrypt(key, '00000000000000000000000000000000');
    if(kcv)
      return kcv.substr(0, 6);
    else
      return null;
  }

  /**
   * [getTerminalKey description]
   * @return {[type]} [description]
   */
  getTerminalKey(){
    return [this.keys.pin_key.key, this.getKeyCheckValue(this.keys.pin_key.key)];
  }


  /**
   * [getMasterKey description]
   * @return {[type]} [description]
   */
  getMasterKey(){
    return [this.keys.master_key.key, this.getKeyCheckValue(this.keys.master_key.key)] ;
  }

  getKey(type){
    switch(type){
    case 'master':
      return this.getMasterKey();

    case 'comms':
    case 'pin':
      return this.getTerminalKey();
    }
  }
  
  /**
   * [dec2hex convert decimal string to hex string, e.g. 040198145193087203201076202216192211251240251237 to 28C691C157CBC94CCAD8C0D3FBF0FBED]
   * @param  {[type]} dec_string [decimal string ]
   * @return {[type]}            [hex string]
   */
  dec2hex(dec_string){
    let hex_string = '';
    for(let i = 0; i < dec_string.length; i += 3){
      let chunk = parseInt(dec_string.substr(i, 3), 10).toString(16);
      (chunk.length === 1) ? (hex_string = hex_string + '0' + chunk ) : hex_string += chunk;
    }

    return hex_string.toUpperCase();
  }

  /**
   * [setCommsKey description]
   * @param {[type]} key_decimal [description]
   * @param {[type]} length      [description]
   */
  setCommsKey(key_decimal, length){
    let comms_key = this.dec2hex(key_decimal);
    let expected_key_length = parseInt(length, 16) / 1.5;

    if(comms_key.length !== expected_key_length){
      this.log.error('Key length mismatch. New key has length ' + comms_key.length + ', but expected length is ' + expected_key_length);
      return false;
    }

    this.log.info('New comms key received: ' + comms_key);
    if(!this.keys.master_key.key){
      this.log.error('Invalid master key: ' + this.keys.master_key.key);
      return false;
    }

    this.keys.pin_key.key = des3.ecb_decrypt(this.keys.master_key.key, comms_key);
    this.log.info('New comms key value: ' + this.keys.pin_key.key);
    this.settings.set('pin_key', this.keys.pin_key.key);
    return true;
  }

  /**
   * [getEncryptedPIN description]
   * @return {[type]}           [description]
   */
  getEncryptedPIN(PIN_buffer, card_number){
    if(this.keys.pin_key.key){
      this.log.info('Clear PIN block:     [' + this.pinblock.get(PIN_buffer, card_number) + ']');

      let encrypted_pinblock = des3.ecb_encrypt(this.keys.pin_key.key, this.pinblock.get(PIN_buffer, card_number));
      this.log.info('Encrypted PIN block: [' + encrypted_pinblock + ']');

      let atm_pinblock = this.pinblock.encode_to_atm_format(encrypted_pinblock);
      this.log.info('Formatted PIN block: [' + atm_pinblock + ']');
      
      return atm_pinblock;
    } else {
      this.log.error('Terminal key is not set, unable to encrypt PIN block');
      return null;
    }
  }

  format(data){
    let formatted = '';
    for(let i = 0; i < data.length; i++){
      if(i !== 0 && i % 4 === 0)
        formatted += ' ';
      formatted += data[i];
    }
    return formatted;
  }
}

module.exports = CryptoService;
