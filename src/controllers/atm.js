const StatesService = require('../services/states.js');
const ScreensService = require('../services/screens.js');
const FITsService = require('../services/fits.js');
const Trace = require('../controllers/trace.js');

function ATM(settings, log) {
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
        log.info('atm.replySolicitedStatus(): unknown status ' + status);
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
        //this.processState('000');
        break;
      default:
          log.info('atm.processTerminalCommand(): unknown command code: ' + data.command_code);
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
      case 'Screen Data load':
        if(this.screens.add(data.screens))
          return this.replySolicitedStatus('Ready') 
        else
          return this.replySolicitedStatus('Command Reject');

      case 'State Tables load':
        if(this.states.add(data.states))
          return this.replySolicitedStatus('Ready') 
        else
          return this.replySolicitedStatus('Command Reject');

      case 'FIT Data load':
        if(this.FITs.add(data.FITs))
          return this.replySolicitedStatus('Ready')
        else
          return this.replySolicitedStatus('Command Reject');

      case 'Configuration ID number load':
        if(data.config_id){
          this.config_id = data.config_id;
          return this.replySolicitedStatus('Ready');
        }else{
          log.info('ATM.processDataCommand(): wrong Config ID');
          return this.replySolicitedStatus('Command Reject');
        }
        break;

      default:
        log.info('ATM.processDataCommand(): unknown message identifier: ', data.message_identifier);
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
        log.info('atm.processDataCommand(): unknown message sublass: ', data.message_subclass);
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
   * [getMessageCoordinationNumber 
   *  Message Co-Ordination Number is a character assigned by the
   *  terminal to each transaction request message. The terminal assigns a
   *  different co-ordination number to each successive transaction request,
   *  on a rotating basis. Valid range of the co-ordination number is 31 hex
   *  to 3F hex, or if enhanced configuration parameter 34 ‘MCN Range’ has
   *  been set to 001, from 31 hex to 7E hex. Central must include the
   *  corresponding co-ordination number when responding with a
   *  Transaction Reply Command.
   *  
   *  This ensures that the Transaction Reply matches the Transaction
   *  Request. If the co-ordination numbers do not match, the terminal
   *  sends a Solicited Status message with a Command Reject status.
   *  Central can override the Message Co-Ordination Number check by
   *  sending a Co-Ordination Number of ‘0’ in a Transaction Reply
   *  command. As a result, the terminal does not verify that the
   *  Transaction Reply co-ordinates with the last transaction request
   *  message.]
   * @return {[type]} [description]
   */
  this.getMessageCoordinationNumber = function(){
    var saved = settings.get('message_coordination_number');
    if(!saved)
      saved = '\x31';

    saved = (parseInt(saved) + 1).toString();

    if(saved > '\x3F')
      saved = '\x31';

    settings.set('message_coordination_number', saved);
    return saved;
  } 

  /**
   * [getEncryptedPIN description]
   * @param  {[type]} clear_pin [description]
   * @return {[type]}           [description]
   */
  this.getEncryptedPIN = function(){
    // this.PIN_buffer
    return '1234567891234567';
  }

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
    // In a real ATM PIN_buffer contains encrypted PIN, but in this application PIN_buffer contains clear PIN entered  by cardholder.
    // To get the encrypted PIN, use getEncryptedPIN() method
    this.PIN_buffer = '';

    this.buffer_B = '';
    this.buffer_C = '';
    this.amount_buffer = '000000000000';
    this.opcode_buffer = '        ';
    this.FDK_buffer = '0000000000000';

    return true;
  }

  /**
   * [setScreen description]
   * @param {[type]} screen_number [description]
   */
  this.setScreen = function(screen_number){
    this.current_screen = this.screens.get(screen_number)
    if(this.current_screen){
      log.info('Screen changed to ' + this.current_screen.number);
    } else {
      log.error('atm.setScreen(): unable to find screen ' + screen_number);
    }
  }

  /**
   * [processStateA process the Card Read state]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateA = function(state){
    this.initBuffers();
    this.setScreen(state.screen_number)

    return state.good_read_next_state;
  }

  this.processStateB = function(state){
    this.setScreen(state.screen_number)
    this.max_pin_length = this.FITs.getMaxPINLength(this.card.number)

    if(this.PIN_buffer.length > 3){
      // TODO: PIN encryption 
      return state.remote_pin_check_next_state
    }
  }

  /**
   * [setOpCodeBufferValueAt set this.opcode_buffer[position] with the value ]
   * @param {[type]} position [description]
   * @param {[type]} value    [description]
   */
  this.setOpCodeBufferValueAt = function(position, value){
    this.opcode_buffer = this.opcode_buffer.substr(0, position) + value + this.opcode_buffer.substr(position + 1)
  }

  /**
   * [setOpCodeBuffer process the D state logic (Pre‐Set Operation Code Buffer)]
   * @param {[state]} state [D-type state]
   * @param {[extension_state]} state [Z-type state]
   */
  this.setOpCodeBuffer = function(state, extension_state){
    /**
     * Specifies bytes of Operation Code buffer to be cleared to graphic ‘space’. Each bit relates to a byte
     * in the Operation Code buffer. If a bit is zero, the corresponding entry is cleared. If a bit is one, the
     * corresponding entry is unchanged. 
     */
    var mask = state.clear_mask;
    for(var bit = 0; bit < 8; bit++){
      if((mask & Math.pow(2, bit)).toString() === '0')
        this.setOpCodeBufferValueAt(bit, ' ');
    }

    /**
     * The buffer contains eight bytes. This entry sets the specified bytes to one of the values from keys[]. If a bit is one, the
     * corresponding entry is set to keys[i]. If a bit is zero, the corresponding entry is unchanged.
     */
    var keys = ['A', 'B', 'C', 'D'];
    ['A_preset_mask',
     'B_preset_mask',
     'C_preset_mask',
     'D_preset_mask'
     ].forEach( (element, i) => {
        mask = state[element];
        for(var bit = 0; bit < 8; bit++){
          if((mask & Math.pow(2, bit)).toString() === Math.pow(2, bit).toString())
            this.setOpCodeBufferValueAt(bit, keys[i]);
        }
     });

    if(extension_state && extension_state.entries){
      var keys = ['F', 'G', 'H', 'I'];
      for(var i = 0; i < 4; i++){
        mask = extension_state.entries[i];
        for(var bit = 0; bit < 8; bit++){
          if((mask & Math.pow(2, bit)).toString() === Math.pow(2, bit).toString())
            this.setOpCodeBufferValueAt(bit, keys[i]);
        }
       };
    }

    return true;
  }

  /**
   * [processStateD description]
   * @param  {[type]} state           [description]
   * @param  {[type]} extension_state [description]
   * @return {[type]}                 [description]
   */
  this.processStateD = function(state, extension_state){
    this.setOpCodeBuffer(state, extension_state);
    log.info('Operation code buffer set to \'' + this.opcode_buffer + '\'');
    return state.next_state;
  }

  /**
   * [processTransactionRequestState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processTransactionRequestState = function(state){
    this.setScreen(state.screen_number);

    var request = {
      message_class: 'Unsolicited',
      message_subclass: 'Transaction Request',
      top_of_receipt: '1',
      message_coordination_number: this.getMessageCoordinationNumber(),
    };

    if(state.send_track2 === '001')
      request.track2 = this.track2;

    // Send Track 1 and/or Track 3 option is not supported 

    if(state.send_operation_code === '001')
      request.opcode_buffer = this.opcode_buffer;

    if(state.send_amount_data === '001')
      request.amount_buffer = this.amount_buffer;

    switch(state.send_pin_buffer){
      case '001':   // Standard format. Send Buffer A
      case '129':   // Extended format. Send Buffer A
        request.PIN_buffer = this.getEncryptedPIN();
        break;
      case '000':   // Standard format. Do not send Buffer A
      case '128':   // Extended format. Do not send Buffer A
      default:
        break;
    }

    switch(state.send_buffer_B_buffer_C){
      case '000': // Send no buffers
        break;

      case '001': // Send Buffer B
        request.buffer_B = this.buffer_B;
        break;

      case '002': // Send Buffer C
        request.buffer_C = this.buffer_C;
        break;

      case '003': // Send Buffer B and C
        request.buffer_B = this.buffer_B;
        request.buffer_C = this.buffer_C;
        break;

      default:
        // TODO: If the extended format is selected in table entry 8, this entry is an Extension state number.
        if(state.send_pin_buffer in ['128', '129']){
          null;
        }
        break;
    }

    this.transaction_request = request; // further processing is performed by the atm listener
  }

  /**
   * [processCloseState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processCloseState = function(state){
    this.setScreen(state.receipt_delivered_screen);
  }

  /**
   * [processStateK description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateK = function(state){
    var institution_id = this.FITs.getInstitutionByCardnumber(this.card.number)
    // log.info('Found institution_id ' + institution_id);
    return state.states[parseInt(institution_id)];
  }

  /**
   * [processStateW description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateW = function(state){
    return state.states[this.FDK_buffer]
  }

  /**
   * [processStateX description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateX = function(state){
    this.setScreen(state.screen_number);

    var button = this.buttons_pressed.shift();
    if(button){
      this.FDK_buffer = button;
      return state.FDK_next_state;
    }
  }

  /**
   * [processStateY description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateY = function(state){
    this.setScreen(state.screen_number);
    this.current_state = state;

    var button = this.buttons_pressed.shift();
    if(button){
      this.FDK_buffer = button;
      return state.FDK_next_state;
    }
  }

  /**
   * [processStateBeginICCInit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateBeginICCInit = function(state){
    return state.icc_init_not_started_next_state;
  }

  /**
   * [processStateCompleteICCAppInit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processStateCompleteICCAppInit = function(state){
    var extension_state = this.states.get(state.extension_state);
    this.setScreen(state.please_wait_screen_number);

    log.info(this.trace.object(extension_state))
    return extension_state.entries[8]; // Processing not performed
  }

  /**
   * [processSetICCDataState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.processSetICCDataState = function(state){
    // No processing as ICC cards are not currently supported
    return state.next_state;
  }

  /**
   * [processState description]
   * @param  {[type]} state_number [description]
   * @return {[type]}              [description]
   */
  this.processState = function(state_number){
    var state = this.states.get(state_number);
    var next_state = null;

    do{
      if(state){
        this.current_state = state;
        log.info('Processing state ' + state.number + state.type + ' (' + state.description + ')');
      }else
      {
        log.error('Error getting state ' + state_number + ': state not found');
        return false;
      }
        
      switch(state.type){
        case 'A':
          next_state = this.processStateA(state);
          break;

        case 'B':
          next_state = this.processStateB(state);
          break;

        case 'D':
          state.extension_state !== '255' ? next_state = this.processStateD(state, this.states.get(state.extension_state)) : next_state = this.processStateD(state);
          break;

        case 'I':
          next_state = this.processTransactionRequestState(state);
          break;

        case 'J':
          next_state = this.processCloseState(state);
          break;

        case 'K':
          next_state = this.processStateK(state);
          break;

        case 'X':
          next_state = this.processStateX(state);
          break;

        case 'Y':
          next_state = this.processStateY(state);
          break;

        case 'W':
          next_state = this.processStateW(state);
          break;

        case '+':
          next_state = this.processStateBeginICCInit(state);
          break;

        case '/':
          next_state = this.processStateCompleteICCAppInit(state);
          break;

        case '?':
          next_state = this.processSetICCDataState(state);
          break;

        default:
          log.error('atm.processState(): unsupported state type ' + state.type);
          next_state = null;
      }

      if(next_state)
        state = this.states.get(next_state);
      else
        break;

    }while(state);

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
      log.info(e);
      return null;
    }

    return card;
  }

  this.readCard = function(cardnumber, track2_data){
    this.track2 = cardnumber + '=' + track2_data;
    this.card = this.parseTrack2(this.track2)
    if(this.card){
      log.info('Card ' + this.card.number + ' read');
      this.processState('000');
    }
  }

  this.trace = new Trace();
  this.states = new StatesService(settings, log);
  this.screens = new ScreensService(settings, log);
  this.FITs = new FITsService(settings, log);

  this.status = 'Offline';
  this.initBuffers();
  this.current_screen = {};
  this.current_state = {};
  this.buttons_pressed = [];
  this.transaction_request = null;
}

/**
 * [processFDKButtonPressed description]
 * @param  {[type]} button [description]
 * @return {[type]}        [description]
 */
ATM.prototype.processFDKButtonPressed = function(button){
  log.info(button + ' button pressed');
  this.buttons_pressed.push(button);
  this.processState(this.current_state.number)
};


/**
 * [processPinpadButtonPressed description]
 * @param  {[type]} button [description]
 * @return {[type]}        [description]
 */
ATM.prototype.processPinpadButtonPressed = function(button){
  //log.info('Button ' + button + 'pressed');
  switch(this.current_state.type){
    case 'B':
      this.PIN_buffer += button;
      //log.info(this.PIN_buffer);
      if(this.PIN_buffer.length == this.max_pin_length)
        this.processState(this.current_state.number)
      break;

    default:
      log.error('No keyboard entry allowed for state type ' + this.current_state.type);
      break;
  }
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
      log.info('ATM.processHostMessage(): unknown message class: ' + data.message_class);
      break;
  }
  return false;
};

module.exports = ATM;
