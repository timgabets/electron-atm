const StatesService = require('atm-states');
const ScreensService = require('atm-screens');
const FITsService = require('atm-fits');
const CryptoService = require('../services/crypto.js');
const DisplayService = require('../services/display.js');
const OperationCodeBufferService = require('atm-opcode-buffer');
const Trace = require('atm-trace');
const Pinblock = require('pinblock');
const des3 = require('node-cardcrypto').des;
const ATMHardwareService = require('atm-hardware');

class ATM {
  constructor(settings, log){
    this.settings = settings;
    this.log = log;
    this.trace = new Trace();
    this.states = new StatesService(settings, log, this.trace);
    this.screens = new ScreensService(settings, log, this.trace);
    this.FITs = new FITsService(settings, log, this.trace);
    this.crypto = new CryptoService(settings, log);
    this.display = new DisplayService(this.screens, log);
    this.pinblock = new Pinblock();
    this.opcode = new OperationCodeBufferService();
    this.hardware = new ATMHardwareService();

    this.setStatus('Offline');
    this.initBuffers();
    this.initCounters();
    this.current_state = null;
    this.buttons_pressed = [];
    this.activeFDKs = [];
    this.transaction_request = null;
  }

  getBuffer(type){
    switch(type){
    case 'pin':
      return this.PIN_buffer;
    case 'B':
      return this.buffer_B;
    case 'C':
      return this.buffer_C;
    case 'opcode':
      return this.opcode.getBuffer();
    case 'amount':
      return this.amount_buffer;
    }
  }

  /**
   * [isFDKButtonActive check whether the FDKs is active or not]
   * @param  {[type]}  button [FDK button to be checked, e.g. 'A', 'G' (case does not matter - 'a', 'g' works as well) ]
   * @return {Boolean}        [true if FDK is active, false if inactive]
   */
  isFDKButtonActive(button){
    if(!button)
      return;

    for (let i = 0; i < this.activeFDKs.length; i++)
      if(button.toUpperCase() === this.activeFDKs[i] )
        return true; 
    
    return false;
  }

  /**
   * [setFDKsActiveMask set the current FDK mask ]
   * @param {[type]} mask [1. number from 000 to 255, represented as string, OR
   *                       2. binary mask, represented as string, e.g. 100011000 ]
   */
  setFDKsActiveMask(mask){
    if(mask.length <= 3 && mask.length !== 0){
      // 1. mask is a number from 000 to 255, represented as string
      if(mask > 255){
        this.log.error('Invalid FDK mask: ' + mask);
        return;
      }

      this.activeFDKs = [];
      let FDKs = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I'];  // E excluded
      for(let bit = 0; bit < 8; bit++)
        if((mask & Math.pow(2, bit)).toString() !== '0')
          this.activeFDKs.push(FDKs[bit]);

    } else if(mask.length > 0) {
      // 2. mask is a binary mask, represented as string, e.g. 100011000 
      this.activeFDKs = [];
      
      // The first character of the mask is a 'Numeric Keys activator', and is not currently processed
      mask = mask.substr(1, mask.length);

      let FDKs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']; // E included
      for(let i = 0; i < mask.length; i++)
        if(mask[i] === '1')
          this.activeFDKs.push(FDKs[i]);
    } else  
      this.log.error('Empty FDK mask');
  }

  getTerminalStateReply(command_code){
    let reply = {};

    if(command_code)
      reply.terminal_command = command_code;

    switch(command_code){
    case 'Send Configuration Information':
      reply.config_id = this.getConfigID();
      reply.hardware_fitness = this.hardware.getHardwareFitness();
      reply.hardware_configuration = '157F000901020483000001B1000000010202047F7F00';
      reply.supplies_status = this.hardware.getSuppliesStatus();
      reply.sensor_status = '000000000000';
      reply.release_number = this.hardware.getReleaseNumber();
      reply.ndc_software_id = this.hardware.getHarwareID();
      break;

    case 'Send Configuration ID':
      reply.config_id = this.getConfigID();
      break;

    case 'Send Supply Counters':
      {
        let counters = this.getSupplyCounters();
        for(let c in counters) reply[c] = counters[c];
      }
      break;

    default:
      break;
    }

    return reply;
  }

  /**
   * [replySolicitedStatus description]
   * @param  {[type]} status [description]
   * @return {[type]}        [description]
   */
  replySolicitedStatus(status, command_code){
    let reply = {};
    reply.message_class = 'Solicited';
    reply.message_subclass = 'Status'; 

    switch(status){
    case 'Ready':
    case 'Command Reject':
    case 'Specific Command Reject':
      reply.status_descriptor = status;
      break;
        
    case 'Terminal State':
      {
        reply.status_descriptor = status;
        let data = this.getTerminalStateReply(command_code);

        for(let c in data) reply[c] = data[c];
      }
      break;

    default:
      this.log.error('atm.replySolicitedStatus(): unknown status ' + status);
      reply.status_descriptor = 'Command Reject';
    }
    return reply;
  }

  /**
   * [processTerminalCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processTerminalCommand(data){
    switch(data.command_code){
    case 'Go in-service':
      this.setStatus('In-Service');
      this.processState('000');
      this.initBuffers();
      this.activeFDKs = [];
      break;
    case 'Go out-of-service':
      this.setStatus('Out-Of-Service');
      this.initBuffers();
      this.activeFDKs = [];
      this.card = null;
      break;
    case 'Send Configuration Information':
    case 'Send Configuration ID':
    case 'Send Supply Counters':
      return this.replySolicitedStatus('Terminal State', data.command_code);

    default:
      this.log.error('atm.processTerminalCommand(): unknown command code: ' + data.command_code);
      return this.replySolicitedStatus('Command Reject');
    }
    return this.replySolicitedStatus('Ready');
  }

  /**
   * [processCustomizationCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processCustomizationCommand(data){
    switch(data.message_identifier){
    case 'Screen Data load':
      if(this.screens.add(data.screens))
        return this.replySolicitedStatus('Ready'); 
      else
        return this.replySolicitedStatus('Command Reject');

    case 'State Tables load':
      if(this.states.add(data.states))
        return this.replySolicitedStatus('Ready'); 
      else
        return this.replySolicitedStatus('Command Reject');

    case 'FIT Data load':
      if(this.FITs.add(data.FITs))
        return this.replySolicitedStatus('Ready');
      else
        return this.replySolicitedStatus('Command Reject');

    case 'Configuration ID number load':
      if(data.config_id){
        this.setConfigID(data.config_id);
        return this.replySolicitedStatus('Ready');
      }else{
        this.log.info('ATM.processDataCommand(): no Config ID provided');
        return this.replySolicitedStatus('Command Reject');
      }

    default:
      this.log.error('ATM.processDataCommand(): unknown message identifier: ', data.message_identifier);
      return this.replySolicitedStatus('Command Reject');
    }
  }

  /**
   * [processInteractiveTransactionResponse description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processInteractiveTransactionResponse(data){
    this.interactive_transaction = true;

    if(data.active_keys){
      this.setFDKsActiveMask(data.active_keys);
    }
    
    this.display.setScreen(this.screens.parseDynamicScreenData(data.screen_data_field));
    return this.replySolicitedStatus('Ready');
  }

  processExtendedEncKeyInfo(data){
    switch(data.modifier){
    case 'Decipher new comms key with current master key':
      if( this.crypto.setCommsKey(data.new_key_data, data.new_key_length) )
        return this.replySolicitedStatus('Ready');
      else
        return this.replySolicitedStatus('Command Reject');

    default:
      this.log.error('Unsupported modifier');
      break;
    }

    return this.replySolicitedStatus('Command Reject');
  }

  /**
   * [processDataCommand description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processDataCommand(data){
    switch(data.message_subclass){
    case 'Customization Command':
      return this.processCustomizationCommand(data);

    case 'Interactive Transaction Response':
      return this.processInteractiveTransactionResponse(data);

    case 'Extended Encryption Key Information':
      return this.processExtendedEncKeyInfo(data);
        
    default:
      this.log.info('atm.processDataCommand(): unknown message sublass: ', data.message_subclass);
      return this.replySolicitedStatus('Command Reject');
    }
  }

  /**
   * [processTransactionReply description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processTransactionReply(data){    
    this.processState(data.next_state);

    if(data.screen_display_update)
      this.screens.parseScreenDisplayUpdate(data.screen_display_update);

    return this.replySolicitedStatus('Ready');
  }

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
  getMessageCoordinationNumber(){
    let saved = this.settings.get('message_coordination_number');
    if(!saved)
      saved = '0';

    saved = String.fromCharCode(saved.toString().charCodeAt(0) + 1);
    if(saved.toString().charCodeAt(0) > 126)
      saved = '1';

    this.settings.set('message_coordination_number', saved);
    return saved;
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
  initBuffers(){
    // In a real ATM PIN_buffer contains encrypted PIN, but in this application PIN_buffer contains clear PIN entered by cardholder.
    // To get the encrypted PIN, use getEncryptedPIN() method
    this.PIN_buffer = '';

    this.buffer_B = '';
    this.buffer_C = '';
    this.amount_buffer = '000000000000';
    this.opcode.init();
    this.FDK_buffer = '';   // FDK_buffer is only needed on state type Y and W to determine the next state

    return true;
  }

  /**
   * [processStateA process the Card Read state]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateA(state){
    this.initBuffers();
    this.display.setScreenByNumber(state.get('screen_number'));
    
    if(this.card)
      return state.get('good_read_next_state');
  }

  /**
   * [processPINEntryState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processPINEntryState(state){
    /**
     * The cardholder enters the PIN, which can consist of from four to
     * sixteen digits, on the facia keyboard. If the cardholder enters fewer
     * than the number of digits specified in the FIT entry, PMXPN, he
     * must press FDK ‘A’ (or FDK ‘I’, if the option which enables the keys
     * to the left of the CRT is set) or the Enter key after the last digit has
     * been entered. Pressing the Clear key clears all digits.
     */
    this.display.setScreenByNumber(state.get('screen_number'));
    this.setFDKsActiveMask('001'); // Enabling button 'A' only

    if(this.PIN_buffer.length > 3){
      // TODO: PIN encryption
      return state.get('remote_pin_check_next_state');
    }
  }

  /**
   * [processAmountEntryState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processAmountEntryState(state){
    this.display.setScreenByNumber(state.get('screen_number'));
    this.setFDKsActiveMask('015'); // Enabling 'A', 'B', 'C', 'D' buttons
    this.amount_buffer = '000000000000';

    let button = this.buttons_pressed.shift();
    if(this.isFDKButtonActive(button))
      return state.get('FDK_' + button + '_next_state');
  }

  /**
   * [processStateD description]
   * @param  {[type]} state           [description]
   * @param  {[type]} extension_state [description]
   * @return {[type]}                 [description]
   */
  processStateD(state, extension_state){
    //this.setBufferFromState(state, extension_state);
    this.opcode.setBufferFromState(state, extension_state);
    return state.get('next_state');
  }

  /**
   * [processFourFDKSelectionState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processFourFDKSelectionState(state){
    this.display.setScreenByNumber(state.get('screen_number'));

    this.activeFDKs = [];
    ['A', 'B', 'C', 'D'].forEach((element, index) => {
      if(state.get('FDK_' + element + '_next_state') !== '255')
        this.activeFDKs.push(element);
    });

    let button = this.buttons_pressed.shift();
    if(this.isFDKButtonActive(button)){
      let index = parseInt(state.get('buffer_location'), 10);
      if(index < 8)
        this.opcode.setBufferValueAt(7 - index, button);
      else
        this.log.error('Invalid buffer location value: ' + state.get('buffer_location') + '. Operation Code buffer is not changed');

      return state.get('FDK_' + button + '_next_state');
    }
  }

  processInformationEntryState(state){
    this.display.setScreenByNumber(state.get('screen_number'));
    let active_mask = '0';
    [ state.get('FDK_A_next_state'),
      state.get('FDK_B_next_state'),
      state.get('FDK_C_next_state'),
      state.get('FDK_D_next_state')].forEach( element => {
      if(element !== '255')
        active_mask += '1';
      else
        active_mask += '0';
    });
    this.setFDKsActiveMask(active_mask);

    let button = this.buttons_pressed.shift();
    if(this.isFDKButtonActive(button)){
      return state.get('FDK_' + button + '_next_state');
    }

    switch(state.get('buffer_and_display_params')[2]){
    case '0':
    case '1':
      this.buffer_C = '';
      break;

    case '2':
    case '3':
      this.buffer_B = '';
      break;

    default: 
      this.log.error('Unsupported Display parameter value: ' + state.get('buffer_and_display_params')[2]);
    }
  }


  processInteractiveTransaction(request){
    this.interactive_transaction = false;

    // Keyboard data entered after receiving an Interactive Transaction Response is stored in General Purpose Buffer B
    let button = this.buttons_pressed.shift();
    if(this.isFDKButtonActive(button)){
      this.buffer_B = button;
      request.buffer_B = button;
    }
    return request;
  }


  /**
   * [processTransactionRequestState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processTransactionRequestState(state){
    this.display.setScreenByNumber(state.get('screen_number'));

    let request = {
      message_class: 'Unsolicited',
      message_subclass: 'Transaction Request',
      top_of_receipt: '1',
      message_coordination_number: this.getMessageCoordinationNumber(),
    };

    if(!this.interactive_transaction){
      if(state.get('send_track2') === '001')
        request.track2 = this.track2;

      // Send Track 1 and/or Track 3 option is not supported 

      if(state.get('send_operation_code') === '001')
        request.opcode_buffer = this.opcode.getBuffer();

      if(state.get('send_amount_data') === '001')
        request.amount_buffer = this.amount_buffer;

      switch(state.get('send_pin_buffer')){
      case '001':   // Standard format. Send Buffer A
      case '129':   // Extended format. Send Buffer A
        request.PIN_buffer = this.crypto.getEncryptedPIN(this.PIN_buffer, this.card.number);
        break;
      case '000':   // Standard format. Do not send Buffer A
      case '128':   // Extended format. Do not send Buffer A
      default:
        break;
      }

      switch(state.get('send_buffer_B_buffer_C')){
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
        if(state.get('send_pin_buffer') in ['128', '129']){
          null;
        }
        break;
      }
    } else {
      request = this.processInteractiveTransaction(request);
    }
    this.transaction_request = request; // further processing is performed by the atm listener
  }

  /**
   * [processCloseState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processCloseState(state){
    this.display.setScreenByNumber(state.get('receipt_delivered_screen'));
    this.setFDKsActiveMask('000');  // Disable all FDK buttons
    this.card = null;
    this.log.info(this.trace.object(state));
  }

  /**
   * [processStateK description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateK(state){
    let institution_id = this.FITs.getInstitutionByCardnumber(this.card.number);
    this.log.info('Card ' + this.card.number + ' matches with institution_id ' + institution_id);
    if(institution_id)
      return state.get('state_exits')[parseInt(institution_id, 10)];
    else
      this.log.error('Unable to get Financial Institution by card number');
  }

  /**
   * [processStateW description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateW(state){
    return state.get('states')[this.FDK_buffer];
  }


  /**
   * [setAmountBuffer assign the provide value to amount buffer]
   * @param {[type]} amount [description]
   */
  setAmountBuffer(amount){
    if(!amount)
      return;
    this.amount_buffer = this.amount_buffer.substr(amount.length) + amount;
  }


  /**
   * [processStateX description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateX(state, extension_state){
    this.display.setScreenByNumber(state.get('screen_number'));
    this.setFDKsActiveMask(state.get('FDK_active_mask'));

    let button = this.buttons_pressed.shift();
    if(this.isFDKButtonActive(button)){
      this.FDK_buffer = button;

      if(extension_state){
        /**
         * Each table entry contains a value that is stored in
         * the buffer specified in the associated FDK
         * Information Entry state table (table entry 7) if the
         * specified FDK or touch area is pressed.
         */
        let buffer_value;
        [null, null, 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'I'].forEach((element, index) => {
          if(button === element)
            buffer_value = extension_state.get('entries')[index];
        });

        /**
         * Buffer ID identifies which buffer is to be edited and the number of zeros to add 
         * to the values specified in the Extension state:
         * 01X - General purpose buffer B
         * 02X - General purpose buffer C
         * 03X - Amount buffer
         * X specifies the number of zeros in the range 0-9
         */
        // Checking number of zeroes to pad
        let num_of_zeroes = state.get('buffer_id').substr(2, 1);
        for (let i = 0; i < num_of_zeroes; i++)
          buffer_value += '0';

        // Checking which buffer to use
        switch(state.get('buffer_id').substr(1, 1)){
        case '1':
          this.buffer_B = buffer_value;
          break;
  
        case '2':
          this.buffer_C = buffer_value;
          break;
  
        case '3':
          this.setAmountBuffer(buffer_value);
          break;
  
        default:
          this.log.error('Unsupported buffer id value: ' + state.get('buffer_id'));
          break;
        }
      }

      return state.get('FDK_next_state');
    }
  }

  /**
   * [processStateY description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateY(state, extension_state){
    this.display.setScreenByNumber(state.get('screen_number'));
    this.setFDKsActiveMask(state.get('FDK_active_mask'));

    if(extension_state){
      this.log.error('Extension state on state Y is not yet supported');
    }else{
      let button = this.buttons_pressed.shift();
      if(this.isFDKButtonActive(button)){
        this.FDK_buffer = button;

        // If there is no extension state, state.get('buffer_positions') defines the Operation Code buffer position 
        // to be edited by a value in the range 000 to 007.
        this.opcode.setBufferValueAt(parseInt(state.get('buffer_positions'), 10), button);
       
        return state.get('FDK_next_state');
      }
    }
  }

  /**
   * [processStateBeginICCInit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateBeginICCInit(state){
    return state.get('icc_init_not_started_next_state');
  }

  /**
   * [processStateCompleteICCAppInit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processStateCompleteICCAppInit(state){
    let extension_state = this.states.get(state.get('extension_state'));
    this.display.setScreenByNumber(state.get('please_wait_screen_number'));

    return extension_state.get('entries')[8]; // Processing not performed
  }

  /**
   * [processICCReinit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processICCReinit(state){
    return state.get('processing_not_performed_next_state');
  }


  /**
   * [processSetICCDataState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  processSetICCDataState(state){
    // No processing as ICC cards are not currently supported
    return state.get('next_state');
  }


  /**
   * [processState description]
   * @param  {[type]} state_number [description]
   * @return {[type]}              [description]
   */
  processState(state_number){
    let state = this.states.get(state_number);
    let next_state = null;

    do{
      if(state){
        this.current_state = state;
        this.log.info('Processing state ' + state.get('number') + state.get('type') + ' (' + state.get('description') + ')');
      } else {
        this.log.error('Error getting state ' + state_number + ': state not found');
        return false;
      }
        
      switch(state.get('type')){
      case 'A':
        next_state = this.processStateA(state);
        break;

      case 'B':
        next_state = this.processPINEntryState(state);
        break;

      case 'D':
        state.get('extension_state') !== '255' ? next_state = this.processStateD(state, this.states.get(state.get('extension_state'))) : next_state = this.processStateD(state);
        break;

      case 'E':
        next_state = this.processFourFDKSelectionState(state);
        break;

      case 'F':
        next_state = this.processAmountEntryState(state);
        break;

      case 'H':
        next_state = this.processInformationEntryState(state);
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
        (state.get('extension_state') !== '255' && state.get('extension_state') !== '000') ? next_state = this.processStateX(state, this.states.get(state.get('extension_state'))) : next_state = this.processStateX(state);
        break;

      case 'Y':
        (state.get('extension_state') !== '255' && state.get('extension_state') !== '000') ? next_state = this.processStateY(state, this.states.get(state.get('extension_state'))) : next_state = this.processStateY(state);
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

      case ';':
        next_state = this.processICCReinit(state);
        break;

      case '?':
        next_state = this.processSetICCDataState(state);
        break;

      default:
        this.log.error('atm.processState(): unsupported state type ' + state.get('type'));
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
  parseTrack2(track2){
    let card = {};
    try{
      let splitted = track2.split('=');
      card.track2 = track2;
      card.number = splitted[0].replace(';', '');
      card.service_code = splitted[1].substr(4, 3);
    }catch(e){
      this.log.info(e);
      return null;
    }

    return card;
  }

  readCard(cardnumber, track2_data){
    this.track2 = cardnumber + '=' + track2_data;
    this.card = this.parseTrack2(this.track2);
    if(this.card){
      this.log.info('Card ' + this.card.number + ' read');
      this.log.info('Track2: ' + this.track2);
      this.processState('000');
    }
    this.setStatus('Processing Card');
  }

  /**
   * [initCounters description]
   * @return {[type]} [description]
   */
  initCounters(){
    let config_id = this.settings.get('config_id');
    (config_id) ? this.setConfigID(config_id) : this.setConfigID('0000');

    this.supply_counters = {};
    this.supply_counters.tsn = '0000';
    this.supply_counters.transaction_count = '0000000';
    this.supply_counters.notes_in_cassettes = '00011000220003300044';
    this.supply_counters.notes_rejected = '00000000000000000000';
    this.supply_counters.notes_dispensed = '00000000000000000000';
    this.supply_counters.last_trxn_notes_dispensed = '00000000000000000000';
    this.supply_counters.card_captured = '00000';
    this.supply_counters.envelopes_deposited = '00000';
    this.supply_counters.camera_film_remaining = '00000';
    this.supply_counters.last_envelope_serial = '00000';
  }

  getSupplyCounters(){
    return this.supply_counters;
  }

  /**
   * [setConfigID description]
   * @param {[type]} config_id [description]
   */
  setConfigID(config_id){
    this.config_id = config_id;
    this.settings.set('config_id', config_id);
  }

  getConfigID(){
    return this.config_id;
  }

  setStatus(status){
    this.status = status;

    switch(status){
    case 'Offline':
    case 'Out-Of-Service':
      this.display.setScreenByNumber('001');
      break;
    }
  }

  /**
   * [processHostMessage description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  processHostMessage(data){
    switch(data.message_class){
    case 'Terminal Command':
      return this.processTerminalCommand(data);

    case 'Data Command':
      return this.processDataCommand(data);

    case 'Transaction Reply Command':
      return this.processTransactionReply(data);
            
    case 'EMV Configuration':
      return this.replySolicitedStatus('Ready');

    default:
      this.log.info('ATM.processHostMessage(): unknown message class: ' + data.message_class);
      break;
    }
    return false;
  }

  /**
   * [processFDKButtonPressed description]
   * @param  {[type]} button [description]
   * @return {[type]}        [description]
   */
  processFDKButtonPressed(button){
    // log.info(button + ' button pressed');
    switch(this.current_state.get('type')){
    case 'B':
      if (button === 'A' && this.PIN_buffer.length >= 4)
        this.processState(this.current_state.get('number'));
      break;

    case 'H':
      {
        let active_mask = '0';
        [ this.current_state.get('FDK_A_next_state'),
          this.current_state.get('FDK_B_next_state'),
          this.current_state.get('FDK_C_next_state'),
          this.current_state.get('FDK_D_next_state')].forEach( element => {
          if(element !== '255')
            active_mask += '1';
          else
            active_mask += '0';
        });
        this.setFDKsActiveMask(active_mask);

        if(this.isFDKButtonActive(button)){
          this.buttons_pressed.push(button);
          this.processState(this.current_state.get('number'));
        }
      }
      break;

    default:
      // No special processing required
      this.buttons_pressed.push(button);
      this.processState(this.current_state.get('number'));
      break;
    }
  }

  processBackspaceButtonPressed(){
    switch(this.current_state.get('type')){
    case 'B':
      this.PIN_buffer = this.PIN_buffer.slice(0, -1);
      this.display.insertText(this.PIN_buffer, '*');
      break;
    case 'F':
      this.amount_buffer = '0' + this.amount_buffer.substr(0, this.amount_buffer.length - 1);
      this.display.insertText(this.amount_buffer);
      break;
    case 'H':
      {
        let buffer;
        let key;

        switch(this.current_state.get('buffer_and_display_params')[2]){
        case '0': // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer C
          this.buffer_C = this.buffer_C.substr(0, this.buffer_C.length - 1);
          key = 'X';
          buffer = this.buffer_C;
          break;
        case '1': // Display data as keyed in. Store data in general-purpose Buffer C
          this.buffer_C = this.buffer_C.substr(0, this.buffer_C.length - 1);
          buffer = this.buffer_C;
          break;
        case '2': // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer B
          this.buffer_B = this.buffer_B.substr(0, this.buffer_B.length - 1);          
          buffer = this.buffer_B;
          key = 'X';
          break;
        case '3': // Display data as keyed in. Store data in general-purpose Buffer B
          this.buffer_B = this.buffer_B.substr(0, this.buffer_B.length - 1);
          buffer = this.buffer_B;
          break;
        }
        this.display.insertText(buffer, key);
      }
      break;
    default:
      break;
    }
  }

  processEnterButtonPressed(){
    switch(this.current_state.get('type')){
    case 'B':
      if(this.PIN_buffer.length >= 4)
        this.processState(this.current_state.get('number'));
      this.display.insertText(this.PIN_buffer, '*');
      break;
    case 'F':
      // If the cardholder presses the Enter key, it has the same effect as pressing FDK ‘A’
      this.buttons_pressed.push('A');
      this.processState(this.current_state.get('number'));
      break;
    default:
      break;
    }
  }

  processEscButtonPressed(){
    switch(this.current_state.get('type')){
    case 'B':
      this.PIN_buffer = '';
      break;
    default:
      break;
    }
  }

  processNumericButtonPressed(button){
    switch(this.current_state.get('type')){
    case 'B':
      this.PIN_buffer += button;
      if(this.PIN_buffer.length >= this.FITs.getMaxPINLength(this.card.number) || this.PIN_buffer.length >= 6 )
        this.processState(this.current_state.get('number'));
      this.display.insertText(this.PIN_buffer, '*');
      break;
    case 'F':
      this.amount_buffer = this.amount_buffer.substr(1) + button;
      this.display.insertText(this.amount_buffer);
      break;
    case 'H':
      {
        let key;
        let buffer;
        let display_param = this.current_state.get('buffer_and_display_params')[2];
        switch(display_param){
        case '0': // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer C
        case '1': // Display data as keyed in. Store data in general-purpose Buffer C
          if(this.buffer_C.length < 32){
            this.buffer_C += button;

            buffer = this.buffer_C;
            if(display_param === '0'){
              key = 'X';
            }
          }
          break;
        case '2': // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer B
        case '3': // Display data as keyed in. Store data in general-purpose Buffer B
          if(this.buffer_B.length < 32){
            this.buffer_B += button;

            buffer = this.buffer_B;
            if(  display_param === '2'){
              key = 'X';
            }
          }
          break;
        default:
          this.log.error('Unsupported Display parameter value: ' + display_param);
        }
       
        // console.log(buffer);
        if(buffer)
          this.display.insertText(buffer, key);
      }
      break;
    default:
      this.log.error('No keyboard entry allowed for state type ' + this.current_state.get('type'));
      break;
    }
  }

  /**
   * [processPinpadButtonPressed description]
   * @param  {[type]} button [description]
   * @return {[type]}        [description]
   */
  processPinpadButtonPressed(button){
    switch(button){
    case 'backspace':
      this.processBackspaceButtonPressed();
      break;
    case 'enter':
      this.processEnterButtonPressed();
      break;
    case 'esc':
      this.processEscButtonPressed();
      break;
    default:
      this.processNumericButtonPressed(button);
    }
  }

  getCurrentState(){
    return this.current_state;
  }
}

module.exports = ATM;
