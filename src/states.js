function States(){
	this.states = {};

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
		}

		return parsed;
	}

}

States.prototype.getState = function(state_number){
    return this.states[state_number];
};

States.prototype.addState = function(state){
	var parsed = this.parseState(state);
	if(state){
		this.states[parsed.number] = parsed;
    	return true;
	}
   	else
   		return false;
};

module.exports = States
