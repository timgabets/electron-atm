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
};

Parser.prototype.parseHostMessage = function(message){
 	return true;
};

module.exports = Parser
