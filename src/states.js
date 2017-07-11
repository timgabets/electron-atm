function States(){
	this.states = {};
}

States.prototype.getState = function(state_number){
    return this.states[state_number];
};

States.prototype.addState = function(state){
    return false;
};

module.exports = States
