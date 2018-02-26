class Builder{
  constructor(luno = '000', header = ''){
    this.luno = luno;
    this.header = header;
  }

  /**
   * [buildSolicitedStatusTerminalState description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  buildSolicitedStatusTerminalState(object){
    let message = '';

    switch(object.terminal_command){
    case 'Send Configuration Information':
      message += 'F\x1C1';
      ['config_id', 'hardware_fitness', 'hardware_configuration', 'supplies_status', 'sensor_status', 'release_number', 'ndc_software_id'].forEach( i => {
        message += object[i] + '\x1C';
      });
      break;

    case 'Send Configuration ID':
      message += 'F\x1C6' + object.config_id;
      break;

    case 'Send Supply Counters':
      message += 'F\x1C2';
      ['tsn', 'transaction_count', 'notes_in_cassettes', 'notes_rejected', 'notes_dispensed', 'last_trxn_notes_dispensed', 'card_captured', 'envelopes_deposited', 'camera_film_remaining', 'last_envelope_serial'].forEach( i => {
        message += object[i];
      });
      break;

    default:
      break;
    }

    return message;
  }

  /**
   * [buildSolicitedStatus description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  buildSolicitedStatus(object){
    let message = '';

    switch(object.status_descriptor){
    case 'Ready':
      message += '9';
      break;
    case 'Command Reject':
      message += 'A';
      break;
    case 'Specific Command Reject':
      message += 'C';
      break;
    case 'Terminal State':
      message += this.buildSolicitedStatusTerminalState(object);
      break;
    default:
      message += 'A';
    }

    return message;
  }

  /**
   * [buildSolicited description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  buildSolicited(object){
    let message = '';
    if(object.message_subclass === 'Status'){
      message += '2\x1C' + this.luno + '\x1C\x1C';
      message += this.buildSolicitedStatus(object);
    }
    return message; 
  }

  /**
   * [buildUnsolicited description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  buildUnsolicited(object){
    let message = '';
    if(object.message_subclass === 'Transaction Request'){
      message += '1\x1C' +  this.luno + '\x1C\x1C';
      object.time_variant_number ? message += object.time_variant_number : message += '';
      message += '\x1C' + object.top_of_receipt + object.message_coordination_number + '\x1C';

      ['track2', 'track3', 'opcode_buffer', 'amount_buffer', 'PIN_buffer', 'buffer_B', 'buffer_C', 'track1'].forEach( i => {
        object[i] ? message += object[i] : message += '';
        message += '\x1C';
      });
    }
    return message;
  }

  /**
   * [build description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  build(object){
    let message = this.header;

    if(!object)
      return null;

    switch(object.message_class){
    case 'Solicited':
      message += 2;
      message += this.buildSolicited(object);
      break;

    case 'Unsolicited':
      message += 1;
      message += this.buildUnsolicited(object);
      break;

    default:
      break;
    }
    return message;
  }
}

module.exports = Builder;
