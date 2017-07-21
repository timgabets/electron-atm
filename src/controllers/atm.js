const StatesService = require('../services/states.js');

function ATM() {
  /**
   * [replySolicitedStatus description]
   * @param  {[type]} status [description]
   * @return {[type]}        [description]
   */
  this.replySolicitedStatus = function(status){
    var reply = {};
    reply.message_class = 'Solicited';
    reply.message_subclass = 'Status'; 

    switch(status){
      case 'Ready':
      case 'Command Reject':
      case 'Specific Command Reject':
        reply.status_descriptor = status;
        break;
      default:
        console.log('atm.replySolicitedStatus(): unknown status ' + status);
        reply.status_descriptor = 'Command Reject';
    }
    return reply;
  };

  /**
   * [processTerminalCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.processTerminalCommand = function(data){
    switch(data.command_code){
      case 'Go out-of-service':
        this.status = 'Out-Of-Service';
        break;
      case 'Go in-service':
        this.status = 'In-Service';
        break;
      default:
          console.log('atm.processTerminalCommand(): unknown command code: ' + data.command_code);
          return this.replySolicitedStatus('Command Reject');
        }
      return this.replySolicitedStatus('Ready');
  } 


  this.processDataCommand = function(data){
    switch(data.message_subclass){
      case 'Customization Command':
        this.processCustomizationCommand(data);
        break;
      case 'Interactive Transaction Response':
        this.processInteractiveTransactionResponse(data);
        break;
      default:
        console.log('atm.processDataCommand(): unknown message sublass: ', data.message_subclass);
        this.sendSolicitedStatus('Command Reject');
        break;
    }
    return this.replySolicitedStatus('Ready');
  }

  this.processTransactionReply = function(data){

  }

  this.states = new StatesService();

  this.status = 'Offline';
}

/**
 * [processButtonPressed description]
 * @param  {[type]} button [description]
 * @return {[type]}        [description]
 */
ATM.prototype.processButtonPressed = function(button){
  console.log(button + ' button pressed')
};

/**
 * [processHostMessage description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
ATM.prototype.processHostMessage = function(data){
  switch(data.message_class){
    case 'Terminal Command':
      return this.processTerminalCommand(data);

    case 'Data Command':
      return this.processDataCommand(data);

    case 'Transaction Reply Command':
      return this.processTransactionReply(data);
            
    default:
      console.log('ATM.processHostMessage(): unknown message class: ' + data.message_class);
      break;
    }
    return false;
};

module.exports = ATM
