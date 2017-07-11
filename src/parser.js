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

    this.parse = function (message, length){
        var splitted = message.split('\x1c')
        var parsed = {};
        
        switch(splitted[0][0]){
            case '1':
                parsed.message_class = 'Terminal Command';
                break;
            default:
                break;
        }

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
    };
};

Parser.prototype.parseHostMessage = function(message){
    return true;
};

module.exports = Parser
