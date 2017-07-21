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

  /**
   * [processCustomizationCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.processCustomizationCommand = function(data){
    switch(data.message_identifier){
      case 'State Tables load':
        if(this.states.add(data.states))
          return this.replySolicitedStatus('Ready') 
        else
          return this.replySolicitedStatus('Command Reject');

      case 'Configuration ID number load':
        if(data.config_id){
          this.config_id = data.config_id;
          return this.replySolicitedStatus('Ready');
        }else{
          console.log('ATM.processDataCommand(): wrong Config ID');
          return this.replySolicitedStatus('Command Reject');
        }
        break;
      default:
        console.log('ATM.processDataCommand(): unknown message identifier: ', data.message_identifier);
        return this.replySolicitedStatus('Command Reject');
    }
    return this.replySolicitedStatus('Command Reject');
  };

  /**
   * [processDataCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.processDataCommand = function(data){
    switch(data.message_subclass){
      case 'Customization Command':
        return this.processCustomizationCommand(data);

      case 'Interactive Transaction Response':
        return this.processInteractiveTransactionResponse(data);
        
      default:
        console.log('atm.processDataCommand(): unknown message sublass: ', data.message_subclass);
        return this.replySolicitedStatus('Command Reject');
    }
    return this.replySolicitedStatus('Command Reject');
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
