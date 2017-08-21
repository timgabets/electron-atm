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
                break
            default:
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

        parsed.transaction_serial_number = splitted[5].substring(0, 4)
        parsed.function_identifier = splitted[5].substring(4, 5)
        parsed.screen_number = splitted[5].substring(5, 8)

        parsed.message_coordination_number = splitted[6].substring(0, 1)
        parsed.card_return_flag = splitted[6].substring(1, 2)
        parsed.printer_flag = splitted[6].substring(2, 3)

        return parsed;
    }
};

Parser.prototype.parseHostMessage = function(message){
    return this.parse(message.toString('utf8').substring(2), this.getIncomingMessageLength(message.toString('utf8')));
};

module.exports = Parser
