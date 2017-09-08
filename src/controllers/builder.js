function Builder(luno) {
  if (luno)
    this.luno = luno;
  else
    this.luno = '000';
}

Builder.prototype.build = function(object){
  var message = '';

  if (!object)
    return null;

  switch(object.message_class){
    case 'Solicited':
      message += 2;

      switch(object.message_subclass){
        case 'Status':
          message += '2\x1C' + this.luno + '\x1C\x1C';
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
              if(object.config_id){
                // Send Configuration ID
                message += 'F\x1C6' + object.config_id;
              } else if(object.tsn) {
                // Send Supply Counters
                message += 'F\x1C2';
                message += object.tsn;
                message += object.transaction_count;
                message += object.notes_in_cassettes;
                message += object.notes_rejected;
                message += object.notes_dispensed;
                message += object.last_trxn_notes_dispensed;
                message += object.card_captured;
                message += object.envelopes_deposited;
                message += object.camera_film_remaining;
                message += object.last_envelope_serial;
              }

              break;
            default:
              message += 'A';
          }
          break;
        default:
            break;
      }
      break;

    case 'Unsolicited':
      message += 1;
      
      switch(object.message_subclass){
        case 'Transaction Request':
          message += '1'
          message += '\x1C';
          message += this.luno;
          message += '\x1C';
          message += '\x1C';
          object.time_variant_number ? message += object.time_variant_number : message += '';
          message += '\x1C';
          message += object.top_of_receipt;
          message += object.message_coordination_number;
          message += '\x1C';
          object.track2 ? message += object.track2 : message += '';
          message += '\x1C'
          object.track3 ? message += object.track3 : message += '';
          message += '\x1C'
          object.opcode_buffer ? message += object.opcode_buffer : message += '';
          message += '\x1C'
          object.amount_buffer ? message += object.amount_buffer : message += '';
          message += '\x1C'
          object.PIN_buffer ? message += object.PIN_buffer : message += '';
          message += '\x1C';
          object.buffer_B ? message += object.buffer_B : message += '';
          message += '\x1C';
          object.buffer_C ? message += object.buffer_C : message += '';
          message += '\x1C';
          object.track1 ? message += object.track1 : message += '';
          message += '\x1C';
          break;
      }
      break;

    default:
      break;
  }
  return message;
};

module.exports = Builder
