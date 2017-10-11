function Parser(){
    /**
     * [getIncomingMessageLength checks first two bytes of incoming message to get the length]
     * @param  {[type]} message [message to be checked]
     * @return {[type]}         [length of the message as decimal number]
     */
    this.getIncomingMessageLength = function(message){
        var len = parseInt(message.charCodeAt(0)) * 256 + parseInt(message.charCodeAt(1));
        if(!isNaN(len))
            return len
        else
            return 0;
    };

    /**
     * [parse parse the message from host]
     * @param  {[type]} message [actual message without header length]
     * @param  {[type]} length  [length of the message to parse]
     * @return {[type]}         [parsed object]
     */
    this.parse = function (message, length){
        var splitted = message.split('\x1c')
        switch(splitted[0][0]){
            case '1':
                return this.parseTerminalCommand(splitted);
            case '3':
                return this.parseDataCommand(splitted);
            case '4':
                return this.parseTransactionReply(splitted);
            default:
                console.log('Unhandled message class' + splitted[0][0]);
                break;
        }
    };

    /**
     * [parseTerminalCommand parse host command message class 1]
     * @param  {[type]} splitted [description]
     * @return {[type]}          [description]
     */
    this.parseTerminalCommand = function(splitted){
        var parsed = {};
        parsed.message_class = 'Terminal Command';
        parsed.LUNO = splitted[1];
        parsed.message_sequence_number = splitted[2];
        
        switch(splitted[3][0]){
            case '1':
                parsed.command_code = 'Go in-service';
                break;
            case '2':
                parsed.command_code = 'Go out-of-service';
                break;
            case '3':
                parsed.command_code = 'Send Configuration ID';
                break;
            case '4':
                parsed.command_code = 'Send Supply Counters';
                break;
            case '7':
                parsed.command_code = 'Send Configuration Information';
                break;
            default:
                parsed.command_code = splitted[3][0];
                break;
        }
        
        return parsed;
    }

    this.parseDataCommand = function(splitted){
        var parsed = {};
        parsed.message_class = 'Data Command';
        parsed.LUNO = splitted[1];
        parsed.message_sequence_number = splitted[2];

        switch(splitted[3][0]){
            case '1':
                parsed.message_subclass = 'Customization Command';
                switch(splitted[3][1]){
                    case '1':
                        parsed.message_identifier = 'Screen Data load';
                        parsed.screens = []
                        for(var i = 4; i < splitted.length; i++){
                            parsed.screens.push(splitted[i]);
                        }
                        break;

                    case '2':
                        parsed.message_identifier = 'State Tables load';
                        parsed.states = [];
                        for(var i = 4; i < splitted.length; i++){
                            parsed.states.push(splitted[i]);
                        }
                        break;

                    case '5':
                        parsed.message_identifier = 'FIT Data load';
                        parsed.FITs = [];
                        for(var i = 4; i < splitted.length; i++){
                            parsed.FITs.push(splitted[i]);
                        }
                        break;
                    
                    case '6':
                        parsed.message_identifier = 'Configuration ID number load';
                        parsed.config_id = splitted[4];
                        break;

                    default:
                        break;
                }
                break;

            case '2':
                parsed.message_subclass = 'Interactive Transaction Response';
                parsed.display_flag = splitted[3][1];
                parsed.active_keys = splitted[3].substr(2);

                parsed.screen_timer_field = splitted[4];
                parsed.screen_data_field = splitted[5];
                break;

            case '4':
                parsed.message_subclass = 'Extended Encryption Key Information';
                switch(splitted[3][1]){
                    case '2':
                      parsed.modifier = 'Decipher new comms key with current master key';
                      parsed.new_key_length = splitted[4].substr(0, 3);
                      parsed.new_key_data = splitted[4].substr(3);
                      break;
                }
                break;
        }

        return parsed;
    };


    /**
     * [parseTransactionReply parse host command message class 4]
     * @param  {[type]} splitted [description]
     * @return {[type]}          [description]
     */
    this.parseTransactionReply = function(splitted){
        var parsed = {};
        parsed.message_class = 'Transaction Reply Command';
        parsed.LUNO = splitted[1];
        parsed.message_sequence_number = splitted[2];

        parsed.next_state = splitted[3]

        parsed.notes_to_dispense = splitted[4];

        if(splitted[5]){
          parsed.transaction_serial_number = splitted[5].substring(0, 4)
          parsed.function_identifier = this.getFunctionIdentifierDescription(splitted[5].substring(4, 5))
          parsed.screen_number = splitted[5].substring(5, 8)
          if(splitted[5].substring(8))
            parsed.screen_display_update = splitted[5].substring(8)
        }

        if(splitted[6]){ 
          parsed.message_coordination_number = splitted[6].substring(0, 1)
          parsed.card_return_flag = this.getCardReturnFlagDescription(splitted[6].substring(1, 2))

          // q and r sub fields
          splitted[6].substring(2).split('\x1d').forEach( (element, i) => {
            switch(element[0]){
              case '1':
                // Print on journal printer only
                parsed.journal_printer_data = element.substr(1);
                break;
              case '2':
                // Print on receipt printer only
                parsed.receipt_printer_data = element.substr(1);
                break;
              case '3':
                // Print on receipt and journal printer
                parsed.receipt_printer_data = parsed.journal_printer_data = element.substr(1);
                break;
            }
          });
        }

        return parsed;
    };

    /**
     * [getFunctionIdentifierDescription description]
     * @param  {[type]} function_identifier [description]
     * @return {[type]}                     [description]
     */
    this.getFunctionIdentifierDescription = function(function_identifier){
      switch(function_identifier){
        case '1':
        case '7':
          return {[function_identifier]: 'Deposit and print'};
        case '2':
        case '8':
          return {[function_identifier]: 'Dispense and print'};
        case '3':
        case '9':
          return {[function_identifier]: 'Display and print'};
        case '4':
          return {[function_identifier]: 'Print immediate'};
        case '5':
          return {[function_identifier]: 'Set next state and print'};
        case 'A':
          return {[function_identifier]: 'Eject card and dispense and print (card before cash)'};
        case 'B':
        case 'C':
          return {[function_identifier]: 'Parallel dispense and print and card eject'};
      };
    };

    /**
     * [getCardReturnFlagDescription description]
     * @param  {[type]} card_return_flag [description]
     * @return {[type]}                  [description]
     */
    this.getCardReturnFlagDescription = function(card_return_flag){
      switch(card_return_flag){
        case '0':
          return {'0': 'Return card during the Close state'};
        case '1':
          return {'1': 'Retain card during the Close state'};
        case '4':
          return {'4': 'Return card while processing the transaction reply'};
      }
    };

    /**
     * [getPrinterFlagDescription description]
     * @param  {[type]} printer_flag [description]
     * @return {[type]}              [description]
     */
    this.getPrinterFlagDescription = function(printer_flag){
      switch(printer_flag){
        case '0':
          return {'0': 'Do not print'};
        case '1':
          return {'1': 'Print on journal printer only'};
        case '2':
          return {'2': 'Print on receipt printer only'};
        case '3':
          return {'3': 'Print on receipt and journal printer'};
      }
    };

};

Parser.prototype.parseHostMessage = function(message){
    return this.parse(message.toString('utf8').substring(2), this.getIncomingMessageLength(message.toString('utf8')));
};

module.exports = Parser
