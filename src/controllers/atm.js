const StatesService = require('../services/states.js');
const Log = require('./log.js');

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
        this.log.log('atm.replySolicitedStatus(): unknown status ' + status);
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
        this.changeCurrentState('000');
        break;
      default:
          this.log.log('atm.processTerminalCommand(): unknown command code: ' + data.command_code);
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
          this.log.log('ATM.processDataCommand(): wrong Config ID');
          return this.replySolicitedStatus('Command Reject');
        }
        break;
      default:
        this.log.log('ATM.processDataCommand(): unknown message identifier: ', data.message_identifier);
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
        this.log.log('atm.processDataCommand(): unknown message sublass: ', data.message_subclass);
        return this.replySolicitedStatus('Command Reject');
    }
    return this.replySolicitedStatus('Command Reject');
  }

  /**
   * [processTransactionReply description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.processTransactionReply = function(data){
    // TODO: processing next_state
    return this.replySolicitedStatus('Ready');
  };


  /**
   * [initBuffers clears the terminal buffers
   * When the terminal enters the Card Read State, the following buffers are initialized:
   *  - Card data buffers (no data)
   *  - PIN and General Purpose buffers (no data)
   *  - Amount buffer (zero filled)
   *  - Operation code buffer (space filled)
   *  - FDK buffer (zero filled)]
   * @return {[type]} [description]
   */
  this.initBuffers = function(){
    this.PIN_buffer = null;
    this.buffer_B = null;
    this.buffer_C = null;
    this.amount_buffer = '000000000000';
    this.opcode_buffer = '        ';
    this.FDK_buffer = '0000000000000';

    return true;
  }


  /**
   * [processStateA process the Card Read state]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateA = function(state){
    this.initBuffers();
    this.screen = state.screen_number
    return true;
  }

  /**
   * [changeCurrentState description]
   * @param  {[type]} state_number [description]
   * @return {[type]}              [description]
   */
  this.changeCurrentState = function(state_number){
    var state = this.states.get(state_number);

    if(!state)
      // TODO: process inexistent state
      return false;
    else
      this.current_state = state;

    switch(state.type){
      case 'A':
        this.processStateA(state);
        break;
      default:
        this.log.log('atm.changeCurrentState(): unsupported state type ' + state.type);
    }

    this.log.log('Current state : ' + state.number + state.type + ' (' + state.description + ')');
    return true;
  }

  /**
   * [parseTrack2 parse track2 and return card object]
   * @param  {[type]} track2 [track2 string]
   * @return {[card object]} [description]
   */
  this.parseTrack2 = function(track2){
    var card = {};
    try{
      var splitted = track2.split('=')
      card.track2 = track2;
      card.number = splitted[0].replace(';', '');
      card.service_code = splitted[1].substr(4, 3);
    }catch(e){
      this.log.log(e);
      return null;
    }

    return card;
  }

  this.readCard = function(track2){
    if (this.current_state && this.current_state.type === 'A')
    {
      this.card = this.parseTrack2(track2)
      if(this.card)
        this.current_state = this.current_state.good_read_next_state;
      else
        // TODO: error processing
        this.current_state.error_screen_number;

      this.log.log('Card ' + this.card.number + ' read');
    } else
    {
      this.log.log('Not a Card Read state');
    }
  }

  this.states = new StatesService();
  this.log = new Log();

  this.status = 'Offline';
  this.initBuffers();
}

/**
 * [processButtonPressed description]
 * @param  {[type]} button [description]
 * @return {[type]}        [description]
 */
ATM.prototype.processButtonPressed = function(button){
  this.log.log(button + ' button pressed')
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
      this.log.log('ATM.processHostMessage(): unknown message class: ' + data.message_class);
      break;
  }
  return false;
};

module.exports = ATM
