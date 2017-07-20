const StatesService = require('./services/states.js');

function ATM() {
  this.connection_status = 'disconnected'
  this.states = new StatesService();
}

ATM.prototype.processButtonPressed = function(button){
  console.log(button + ' button pressed')
};


ATM.prototype.processHostMessage = function(message){
  
};

module.exports = ATM
