const StatesService = require('./services/states.js');

function ATM() {
	this.connection_status = 'disconnected'
	this.states = new StatesService();
}

module.exports = ATM
