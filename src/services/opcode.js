function OperationCodeBufferService(log){
  this.buffer = '        ';

  /**
   * [setBufferValueAt set this.opcode_buffer[position] with the value ]
   * @param {[type]} position [description]
   * @param {[type]} value    [description]
   */
  this.setBufferValueAt = function(position, value){
    if(position < 0 || position > 7){
      log.error('Error changing Operation Code Buffer at ' + position + '. Must be non-negative integer less than 8');
      return false;
    }

    if(value.length !== 1 ){
      log.error('Error changing Operation Code Buffer to ' + value + '. Must be single-char string');
      return false;
    }

    switch(value){
      case ' ':
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
        break;
      default:
        log.error('Error setting Operation Code Buffer: incorrect value: ' + value);
        return false;
    }
    
    this.buffer = this.buffer.substr(0, position) + value + this.buffer.substr(position + 1);
    return true;
  };

    /**
   * [setOpCodeBuffer process the D state logic (Pre‐Set Operation Code Buffer)]
   * @param {[state]} state [D-type state]
   * @param {[extension_state]} state [Z-type state]
   */
  this.setOpCodeBuffer = function(state, extension_state){
    /**
     * Specifies bytes of Operation Code buffer to be cleared to graphic ‘space’. Each bit relates to a byte
     * in the Operation Code buffer. If a bit is zero, the corresponding entry is cleared. If a bit is one, the
     * corresponding entry is unchanged. 
     */
    var mask = state.clear_mask;
    for(var bit = 0; bit < 8; bit++){
      if((mask & Math.pow(2, bit)).toString() === '0')
        this.setBufferValueAt(bit, ' ');
    }

    /**
     * The buffer contains eight bytes. This entry sets the specified bytes to one of the values from keys[]. If a bit is one, the
     * corresponding entry is set to keys[i]. If a bit is zero, the corresponding entry is unchanged.
     */
    var keys = ['A', 'B', 'C', 'D'];
    ['A_preset_mask',
     'B_preset_mask',
     'C_preset_mask',
     'D_preset_mask'
     ].forEach( (element, i) => {
        mask = state[element];
        for(var bit = 0; bit < 8; bit++){
          if((mask & Math.pow(2, bit)).toString() === Math.pow(2, bit).toString())
            this.setBufferValueAt(bit, keys[i]);
        }
     });

    if(extension_state && extension_state.entries){
      var keys = [null, null, 'F', 'G', 'H', 'I'];
      for(var i = 2; i < 6; i++){
        mask = extension_state.entries[i];
        for(var bit = 0; bit < 8; bit++){
          if((mask & Math.pow(2, bit)).toString() === Math.pow(2, bit).toString())
            this.setBufferValueAt(bit, keys[i]);
        }
       };
    }

    return true;
  }


}

module.exports = OperationCodeBufferService;