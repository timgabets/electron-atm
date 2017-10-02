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

    if(value.charCodeAt(0) < 65 || // 'A'
       value.charCodeAt(0) > 73) // 'I'
      return false;
    
    this.buffer = this.buffer.substr(0, position) + value + this.buffer.substr(position + 1);
    return true;
  }
}

module.exports = OperationCodeBufferService;