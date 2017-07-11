function States(){
	this.states = {};

	/**
	 * [parseState description]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	this.parseState = function(data){
		var parsed = {};
		parsed.number = data.substring(0, 3)
		parsed.type = data.substring(3, 4)
		
		switch(parsed.type){
			case 'A':
				parsed.screen_number = data.substring(4, 7);
				parsed.good_read_next_state = data.substring(7, 10)
				parsed.error_screen_number = data.substring(10, 13)
				parsed.read_condition_1 = data.substring(13, 16)
				parsed.read_condition_2 = data.substring(16, 19)
				parsed.read_condition_3 = data.substring(19, 22)
				parsed.card_return_flag = data.substring(22, 25)
				parsed.no_fit_match_next_state = data.substring(25, 28)
				break;

			case 'K':
				parsed.states = [];
				for (var i = 4; i < data.length; i+=3){
					parsed.states.push(data.substring(i, i+3))
				};
				break;
			default:
				return null;
		}

		return parsed;
	}
}

/**
 * [getState description]
 * @param  {[type]} state_number [description]
 * @return {[type]}              [description]
 */
States.prototype.getState = function(state_number){
    return this.states[state_number];
};

/**
 * [addState description]
 * @param {[type]} state [description]
 * @return {boolean}     [true if state was successfully added, false otherwise]
 */
States.prototype.addState = function(state){
	var parsed = this.parseState(state);
	if(parsed){
		this.states[parsed.number] = parsed;
    	return true;
	}
   	else
   		return false;
};

/**
 * [addStates description]
 * @param {[type]} states [array of states to add]
 * @return {boolean}     [true if states were successfully added, false otherwise]
 */
States.prototype.addStates = function(states){
	for (var i = 0; i < states.length; i++){
		if(!this.addState(states[i]))
			return false;
	}
	return true;
};

module.exports = States
