import test from 'ava';
import Log from 'atm-logging';
import ATM from '../../src/controllers/atm.js';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body><pre id="log-output" class="log-output" type="text"></pre></body></html>');
const { window } = jsdom;

global.window = window;
global.document = window.document;

const status_ready = { 
  message_class: 'Solicited', 
  message_subclass: 'Status', 
  status_descriptor: 'Ready' 
};

const command_reject = { 
  message_class: 'Solicited', 
  message_subclass: 'Status', 
  status_descriptor: 'Command Reject' 
};

let s = {};
const settings = {
  get: function(item) {
    if(s[item])
      return s[item];
    else
      return {};
  },
  set: function(item, value){
    s[item] = value;
  }
};

const log = new Log();

test('should init terminal buffers', t => {
  const atm = new ATM(settings, log);

  t.is(atm.initBuffers(), true);
  t.is(atm.PIN_buffer, '');
  t.is(atm.buffer_B, '');
  t.is(atm.buffer_C, '');
  t.is(atm.amount_buffer, '000000000000');
  t.is(atm.opcode.getBuffer(), '        ');
  t.is(atm.FDK_buffer, '');
});

/**
 * describe('parseTrack2()', t => {
 */
test('should parse track2', t => {
  const atm = new ATM(settings, log);
  const track2 = ';4575270595153145=20012211998522600001?';
  const card = {
    number: '4575270595153145',
    service_code: '221',
    track2: ';4575270595153145=20012211998522600001?'
  };

  t.deepEqual(atm.parseTrack2(track2), card);
});

test('should return null if track2 is invalid', t => {
  const atm = new ATM(settings, log);
  const track2 = ';4575270595153145D200?';

  t.is(atm.parseTrack2(track2), null);
});

/**
 * describe('processHostMessage()', t => {
 */
test('should return false on empty message', t => {
  const atm = new ATM(settings, log);
  const host_message = {};
  
  t.deepEqual(atm.processHostMessage(host_message), false);
});

// Terminal Command     
test('should respond with "Command Reject" message to unknown Terminal Command host message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Terminal Command',
    command_code: 'IDDQD',
  };

  t.is(atm.status, 'Offline');
  t.deepEqual(atm.processHostMessage(host_message), command_reject);
  t.is(atm.status, 'Offline');      
});

test('should process "Go out-of-service" message properly and respond with "Ready" message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Terminal Command',
    command_code: 'Go out-of-service',
  };

  t.is(atm.status, 'Offline');
  t.deepEqual(atm.processHostMessage(host_message), status_ready);
  t.is(atm.status, 'Out-Of-Service');      
});

test('should process "Go in-service" message properly and respond with "Ready" message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Terminal Command',
    command_code: 'Go in-service',
  };

  t.is(atm.status, 'Offline');
  t.deepEqual(atm.processHostMessage(host_message), status_ready);
  t.is(atm.status, 'In-Service');      
});

// Data Command     
test('should respond with "Command Reject" message to unknown Data Command host message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Data Command',
    command_code: 'IDDQD',
  };

  t.deepEqual(atm.processHostMessage(host_message), command_reject);
}); 

test('should respond with "Command Reject" message to invalid "State Tables load" host message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Data Command',
    message_subclass: 'Customization Command',
  };

  t.deepEqual(atm.processHostMessage(host_message), command_reject);
}); 


test('should respond with "Ready" message to "State Tables load" host message', t => {
  const atm = new ATM(settings, log);
  const host_message = {
    message_class: 'Data Command',
    message_subclass: 'Customization Command',
    message_identifier: 'State Tables load',
    states: '001K003004004127127127127127'
  };

  t.deepEqual(atm.processHostMessage(host_message), status_ready);
}); 

/**
 * describe("setFDKsActiveMask()', t => {
 */
test('should show log error message when empty mask passed', t => {
  const atm = new ATM(settings, log);
  
  atm.log.error = sinon.spy();
  atm.setFDKsActiveMask('');

  t.true(atm.log.error.calledWith('Empty FDK mask'));
  t.deepEqual(atm.activeFDKs, []);
});

test('FDK mask 000 should enable disable all the buttons', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('000');
  t.deepEqual(atm.activeFDKs, []);
});

test('FDK mask 060 should enable C, D, F and G buttons', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('060');
  t.deepEqual(atm.activeFDKs, ['C', 'D', 'F', 'G']);
});

test('FDK mask 255 should enable all the buttons', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('255');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I']);
});

test('should leave the current FDK mask unchanged if new FDK mask is invalid', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('129');
  t.deepEqual(atm.activeFDKs, ['A', 'I']);
  atm.setFDKsActiveMask('666');
  t.deepEqual(atm.activeFDKs, ['A', 'I']);
});

test('FDK mask 0100010000 should enable buttons A, E (Cancel) and F', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('0100011000');
  t.deepEqual(atm.activeFDKs, ['A', 'E', 'F']);
});

test('FDK mask 0111111111 should enable all the buttons', t => {
  const atm = new ATM(settings, log);
  
  t.deepEqual(atm.activeFDKs, []);
  atm.setFDKsActiveMask('0111111111');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
});

/**
 * isFDKButtonActive()
 */
test('should return undefined if button value is not provided', t => {
  const atm = new ATM(settings, log);
  t.is(atm.isFDKButtonActive(), undefined);
});

test('should perform case-insensitive check through active FDKs', t => {
  const atm = new ATM(settings, log);
  atm.setFDKsActiveMask('129');
  
  t.deepEqual(atm.activeFDKs, ['A', 'I']);

  t.is(atm.isFDKButtonActive('a'), true);
  t.is(atm.isFDKButtonActive('A'), true);

  t.is(atm.isFDKButtonActive('i'), true);
  t.is(atm.isFDKButtonActive('I'), true);
      
  t.is(atm.isFDKButtonActive('d'), false);
  t.is(atm.isFDKButtonActive('D'), false);
});

/**
 * describe("setAmountBuffer()', t => {
 */
test('should set amount buffer', t => {
  const atm = new ATM(settings, log);
  t.is(atm.amount_buffer, '000000000000');
  atm.setAmountBuffer('15067');
  t.is(atm.amount_buffer, '000000015067');
});

test('should leave amount buffer unchanged if no value provided', t => {
  const atm = new ATM(settings, log);
  t.is(atm.amount_buffer, '000000000000');
  atm.setAmountBuffer('15067');
  t.is(atm.amount_buffer, '000000015067');
  atm.setAmountBuffer();
  t.is(atm.amount_buffer, '000000015067');
});

/**
 * processStateX()
 */
test('should set amount buffer properly when A button pressed', t => {
  const atm = new ATM(settings, log);
  let state = new Map();

  state.set('number', '037');
  state.set('type', 'X');
  state.set('description', 'FDK information entry state');
  state.set('screen_number', '037');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_next_state', '038');
  state.set('extension_state', '037');
  state.set('buffer_id', '033'); // amount buffer, 3 zeroes
  state.set('FDK_active_mask', '255');
  state.set('states_to', [ '002', '131', '038' ]);
  
  let extension_state = new Map();
  extension_state.set('number', '037');
  extension_state.set('type', 'Z');
  extension_state.set('description', 'Extension state');
  extension_state.set('entries', [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] );

  atm.buttons_pressed.push('A');
  t.is(atm.amount_buffer, '000000000000');
  atm.processStateX(state, extension_state);
  t.is(atm.amount_buffer, '000000150000');
});

test('should set amount buffer properly when B button pressed', t => {
  const atm = new ATM(settings, log);
  let state = new Map();
  state.set('number', '037');
  state.set('type', 'X');
  state.set('description', 'FDK information entry state');
  state.set('screen_number', '037');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_next_state', '038');
  state.set('extension_state', '037');
  state.set('buffer_id', '039'); // amount buffer, 9 zeroes
  state.set('FDK_active_mask', '255');
  state.set('states_to', [ '002', '131', '038' ]);
  
  let extension_state = new Map();
  extension_state.set('number', '037');
  extension_state.set('type', 'Z');
  extension_state.set('description', 'Extension state');
  extension_state.set('entries', [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] );

  atm.buttons_pressed.push('B');
  t.is(atm.amount_buffer, '000000000000');
  atm.processStateX(state, extension_state);
  t.is(atm.amount_buffer, '250000000000');
});

test('should set buffer B properly', t => {
  const atm = new ATM(settings, log);
  let state = new Map();
  state.set('number', '037');
  state.set('type', 'X');
  state.set('description', 'FDK information entry state');
  state.set('screen_number', '037');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_next_state', '038');
  state.set('extension_state', '037');
  state.set('buffer_id', '010');  // buffer B, no zeroes
  state.set('FDK_active_mask', '255');
  state.set('states_to', [ '002', '131', '038' ]);
  
  let extension_state = new Map();
  extension_state.set('number', '037');
  extension_state.set('type', 'Z');
  extension_state.set('description', 'Extension state');
  extension_state.set('entries', [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] );

  atm.buttons_pressed.push('C');      
  t.is(atm.buffer_B, '');
  atm.processStateX(state, extension_state);
  t.is(atm.buffer_B, '400');
});

test('should set buffer C properly', t => {
  const atm = new ATM(settings, log);
  let state = new Map();
  state.set('number', '037');
  state.set('type', 'X');
  state.set('description', 'FDK information entry state');
  state.set('screen_number', '037');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_next_state', '038');
  state.set('extension_state', '037');
  state.set('buffer_id', '021');  // buffer B, 1 zero
  state.set('FDK_active_mask', '255');
  state.set('states_to', [ '002', '131', '038' ]);
  
  let extension_state = new Map();
  extension_state.set('number', '037');
  extension_state.set('type', 'Z');
  extension_state.set('description', 'Extension state');
  extension_state.set('entries', [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] );

  atm.buttons_pressed.push('D');      
  t.is(atm.buffer_C, '');
  atm.processStateX(state, extension_state);
  t.is(atm.buffer_C, '6000');
});

/**
 * processStateY()
 */
test('should process state Y without extension state', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  let state = new Map(); 

  state.set('number', '190');
  state.set('type', 'Y');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('FDK_active_mask', '015');

  t.deepEqual(atm.activeFDKs, []);
  atm.processStateY(state);
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('141'));
});

test('should show error while processing state Y with extension state', t => {
  const atm = new ATM(settings, log);
  atm.log.error = sinon.spy();
  let state = new Map(); 

  state.set('number', '190');
  state.set('type', 'Y');
  state.set('screen_number', '141');
  state.set('FDK_active_mask', '015');

  let extension_state = new Map(); 

  state.set('number', '191');
  state.set('type', 'Z');

  atm.processStateY(state, extension_state);
  t.true(atm.log.error.calledWith('Extension state on state Y is not yet supported'));
});

test('should process state Y with active button pressed', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 

  state.set('number', '190');
  state.set('type', 'Y');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('FDK_active_mask', '003');
  state.set('FDK_next_state', '777');

  t.deepEqual(atm.activeFDKs, []);
  atm.buttons_pressed = ['A'];
  t.is(atm.processStateY(state), '777');
  t.deepEqual(atm.activeFDKs, ['A', 'B']);
});

test('should put the pressed button value to the oprcode buffer while processing state Y', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 

  state.set('number', '190');
  state.set('type', 'Y');
  state.set('screen_number', '141');
  state.set('FDK_active_mask', '003');
  state.set('FDK_next_state', '899');
  state.set('buffer_positions', '2');

  t.is(atm.opcode.buffer, '        ');
  atm.buttons_pressed = ['A'];
  t.is(atm.processStateY(state), '899');
  t.is(atm.opcode.buffer, '  A     ');
});

test('should not process state Y when inactive button pressed', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 

  state.set('number', '190');
  state.set('type', 'Y');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('FDK_active_mask', '003');
  state.set('FDK_next_state', '777');

  t.deepEqual(atm.activeFDKs, []);
  atm.buttons_pressed = ['C'];
  t.is(atm.processStateY(state), undefined);
  t.deepEqual(atm.activeFDKs, ['A', 'B']);
});

/**
 * processFourFDKSelectionState()
 */
test('should set active FDK', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 

  state.set('number', '141');
  state.set('type', 'E');
  state.set('description', 'Four FDK selection state');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '571');
  state.set('FDK_D_next_state', '132');
  state.set('buffer_location', '000');

  t.deepEqual(atm.activeFDKs, []);
  atm.processFourFDKSelectionState(state);
  t.deepEqual(atm.activeFDKs, ['C', 'D']);
});

test('should put the pressed button into the opcode buffer', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 

  state.set('number', '141');
  state.set('type', 'E');
  state.set('description', 'Four FDK selection state');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '571');
  state.set('FDK_D_next_state', '132');
  state.set('buffer_location', '000');

  t.is(atm.opcode.getBuffer(), '        ');

  atm.buttons_pressed.push('C');
  atm.processFourFDKSelectionState(state);
  t.is(atm.opcode.getBuffer(), '       C');
});

test('should put the pressed button into the opcode buffer', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
  
  state.set('number', '141');
  state.set('type', 'E');
  state.set('description', 'Four FDK selection state');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '571');
  state.set('FDK_D_next_state', '132');
  state.set('buffer_location', '006');

  t.is(atm.opcode.getBuffer(), '        ');

  atm.buttons_pressed.push('D');
  atm.processFourFDKSelectionState(state);
  t.is(atm.opcode.getBuffer(), ' D      ');
});

test('should leave opcode buffer unchanged if buffer location value is invalid', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
 
  state.set('number', '141');
  state.set('type', 'E');
  state.set('description', 'Four FDK selection state');
  state.set('screen_number', '141');
  state.set('timeout_next_state', '002');
  state.set('cancel_next_state', '131');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '571');
  state.set('FDK_D_next_state', '132');
  state.set('buffer_location', '008');

  t.is(atm.opcode.getBuffer(), '        ');
  atm.buttons_pressed.push('D');
  atm.processFourFDKSelectionState(state);
  t.is(atm.opcode.getBuffer(), '        ');
});

/**
 * processStateBeginICCInit()
 */
test('should pass through ICC state +', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
 
  state.set('number', '998');
  state.set('type', '+');
  state.set('icc_init_not_started_next_state', '400');

  t.is(atm.processStateBeginICCInit(state), '400');
});

/**
 * processStateCompleteICCAppInit() TODO
 */
test('should pass through ICC state /', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
 
  state.set('number', '560');
  state.set('type', '/');
  state.set('extension_state', '332');

  //t.is(atm.processStateCompleteICCAppInit(state), '009');
});




/**
 * getMessageCoordinationNumber()
 */
test('should return proper message coordination number', t => {
  settings.set('message_coordination_number', '0');
  const atm = new ATM(settings, log);
  
  // ASCII code 49 
  t.is(atm.getMessageCoordinationNumber(), '1');
  // 50
  t.is(atm.getMessageCoordinationNumber(), '2');

  for (let i = 0; i < 10; i++ )
    atm.getMessageCoordinationNumber();

  // 61
  t.is(atm.getMessageCoordinationNumber(), '=');
});

test('should rotate message coordination number', t => {
  settings.set('message_coordination_number', '0');
  const atm = new ATM(settings, log);
  
  t.is(atm.getMessageCoordinationNumber(), '1');
  for (let i = 0; i < 75; i++ )
    atm.getMessageCoordinationNumber();

  t.is(atm.getMessageCoordinationNumber(), '}');
  t.is(atm.getMessageCoordinationNumber(), '~');
  // End of cycle, should start over again
  t.is(atm.getMessageCoordinationNumber(), '1');
  t.is(atm.getMessageCoordinationNumber(), '2');
});

/**
 * 'setConfigID() and getConfigID()'
 */
test('should set ConfigID', t => {
  const atm = new ATM(settings, log);
  atm.initCounters();
  atm.setConfigID('0000');
  //spyOn(settings, 'set');
  settings.set = sinon.spy();

  t.is(atm.getConfigID(), '0000');
  atm.setConfigID('0003');
  t.is(atm.getConfigID(), '0003');
  t.true(settings.set.calledOnce);
});

/**
 * replySolicitedStatus()
 */
test('should get reply to \'Send Supply Counters\' terminal command', t => {
  const atm = new ATM(settings, log);
  let reply = atm.replySolicitedStatus('Terminal State', 'Send Supply Counters');

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');

  t.is(reply.tsn, '0000');
  t.is(reply.transaction_count, '0000000');
  t.is(reply.notes_in_cassettes, '00011000220003300044');
  t.is(reply.notes_rejected, '00000000000000000000');
  t.is(reply.notes_dispensed, '00000000000000000000');
  t.is(reply.last_trxn_notes_dispensed, '00000000000000000000');
  t.is(reply.card_captured, '00000');
  t.is(reply.envelopes_deposited, '00000');
  t.is(reply.camera_film_remaining, '00000');
  t.is(reply.last_envelope_serial, '00000');
});

test('should get reply to \'Send Configuration ID\' terminal command', t => {
  const atm = new ATM(settings, log);
  atm.setConfigID('0007');
  let reply = atm.replySolicitedStatus('Terminal State', 'Send Configuration ID');
      
  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');

  t.is(reply.config_id, '0007');
});

/**
 * describe('processCustomizationCommand()', t => {
 */
test('should reply with \'Ready\' to Screen Data load command', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'Screen Data load',
    screens: ['screens data'],
  };
  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Ready');            
});

test('should reply with \'Command Reject\' to Screen Data load command when no screens data provided', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'Screen Data load',
  };
  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Command Reject');            
});

test('should reply with \'Ready\' to State Tables load command', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'State Tables load',
    states: ['000A0010020030004005006007008'],
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Ready');            
});

test('should reply with \'Command Reject\' to State Tables load command when no valid state tables provided', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'State Tables load',
    states: ['iddqd'],
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Command Reject');
});

test('should reply with \'Ready\' to FIT Data load command', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'FIT Data load',
    FITs: ['029000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000'],
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Ready');            
});

test('should reply with \'Command Reject\' to FIT Data load command when no valid FITs provided', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'FIT Data load',
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Command Reject');            
});

test('should reply with \'Ready\' to proper Configuration ID number load command', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'Configuration ID number load',
    config_id: ['0043'],
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Ready');            
});

test('should reply with \'Command Reject\' to Configuration ID number load command without Config ID', t => {
  const atm = new ATM(settings, log);
  let data = {
    message_identifier: 'Configuration ID number load',
  };

  let reply = atm.processCustomizationCommand(data);

  t.is(reply.message_class, 'Solicited');
  t.is(reply.message_subclass, 'Status');    
  t.is(reply.status_descriptor, 'Command Reject');            
});

/**
 * getTerminalStateReply()
 */
test('should return empty object in case of unknown command code', t => {
  const atm = new ATM(settings, log);
  let reply = {};      
  t.deepEqual(atm.getTerminalStateReply(), reply);    
});

test('should return config ID in response to \'Send Configuration ID\'', t => {
  const atm = new ATM(settings, log);
  atm.setConfigID('0034');

  let reply = {
    terminal_command: 'Send Configuration ID',
    config_id: '0034'
  };      
  t.deepEqual(atm.getTerminalStateReply('Send Configuration ID'), reply);    
});

test('should return counters data in response to \'Send Supply Counters\'', t => {
  const atm = new ATM(settings, log);
  atm.initCounters();
  let reply = {
    terminal_command: 'Send Supply Counters',
    tsn: '0000',
    transaction_count: '0000000',
    notes_in_cassettes: '00011000220003300044',
    notes_rejected: '00000000000000000000',
    notes_dispensed: '00000000000000000000',
    last_trxn_notes_dispensed: '00000000000000000000',
    card_captured: '00000',
    envelopes_deposited: '00000',
    camera_film_remaining: '00000',
    last_envelope_serial: '00000'
  };      
  t.deepEqual(atm.getTerminalStateReply('Send Supply Counters'), reply);    
});

test('should respond to \'Send Configuration Information\'', t => {
  const atm = new ATM(settings, log);
  atm.setConfigID('0789');

  let reply = {
    terminal_command: 'Send Configuration Information',
    config_id: '0789',
    hardware_fitness: '00000000000000000000000000000000000000',
    hardware_configuration: '157F000901020483000001B1000000010202047F7F00',
    supplies_status: '00000000000000000000000000',
    sensor_status: '000000000000',
    release_number: '030300',
    ndc_software_id: 'G531‐0283'
  };
  t.deepEqual(atm.getTerminalStateReply('Send Configuration Information'), reply);    
});

/**
 * processStateA()
 */

test('should process state A', t => {
  const atm = new ATM(settings, log);
  atm.card = true;
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('number', '000');
  state.set('type', 'A');
  state.set('screen_number', '141');
  state.set('good_read_next_state', '002');

  t.is(atm.processStateA(state), '002');    
  t.true(atm.display.setScreenByNumber.calledWith('141'));
});

/**
 * processPINEntryState()
 */

test('should process state B', t => {
  const atm = new ATM(settings, log);
  atm.card = {
    number: '4444555566667777'
  };
  atm.PIN_buffer = '1234';
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('number', '001');
  state.set('type', 'B');
  state.set('screen_number', '993');
  state.set('remote_pin_check_next_state', '202');

  t.is(atm.processPINEntryState(state), '202');    
  t.true(atm.display.setScreenByNumber.calledWith('993'));
});

/**
 * processAmountEntryState()
 */

test('should process amount entry state F when no button pressed', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('screen_number', '997');

  t.is(atm.processAmountEntryState(state), undefined);
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process amount entry state F when A button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['A'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '111');

  t.is(atm.processAmountEntryState(state), '111');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process amount entry state F when B button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['B'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('screen_number', '997');
  state.set('FDK_B_next_state', '222');

  t.is(atm.processAmountEntryState(state), '222');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process amount entry state F when C button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['C'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('screen_number', '997');
  state.set('FDK_C_next_state', '333');

  t.is(atm.processAmountEntryState(state), '333');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process amount entry state F when D button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['D'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('screen_number', '997');
  state.set('FDK_D_next_state', '444');

  t.is(atm.processAmountEntryState(state), '444');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should not change state on amount entry state F if F, G, H or I button pressed', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'F');

  atm.buttons_pressed = ['F'];
  t.is(atm.processAmountEntryState(state), undefined);
  atm.buttons_pressed = ['G'];
  t.is(atm.processAmountEntryState(state), undefined);
  atm.buttons_pressed = ['H'];
  t.is(atm.processAmountEntryState(state), undefined);
  atm.buttons_pressed = ['I'];
  t.is(atm.processAmountEntryState(state), undefined);
});

/**
 * processStateD()
 */
test('should process state D', t => {
  const atm = new ATM(settings, log);
  
  let state = new Map(); 
  state.set('type', 'D');
  state.set('next_state', '123');

  t.is(atm.processStateD(state), '123');
});

/**
 * processState()
 */
test('should process state flow A -> D -> B', t => {
  settings.set('states', {});
  const atm = new ATM(settings, log);
  atm.card = {
    number: '4444555566667777'
  };

  let state_string = '000A870127128002002002001127';
  let A000 = atm.states.parseState(state_string);
  t.is(atm.states.add(state_string), true);
  t.is(A000.get('number'), '000');
  t.is(A000.get('type'), 'A');
  t.is(A000.get('good_read_next_state'), '127');


  state_string = '127D500000128001002003004005';
  let D127 = atm.states.parseState(state_string);
  t.is(atm.states.add(state_string), true);
  t.is(D127.get('number'), '127');
  t.is(D127.get('type'), 'D');
  t.is(D127.get('next_state'), '500');

  state_string = '500B024002131026026138026003';
  let B500 = atm.states.parseState(state_string);
  t.is(atm.states.add(state_string), true);
  t.is(B500.get('number'), '500');
  t.is(B500.get('type'), 'B');


  // Validating each state:
  t.is(atm.processStateA(A000), '127');
  t.is(atm.processStateD(D127), '500');
  t.is(atm.processPINEntryState(B500), undefined); 

  // processing the states A -> D -> B:
  t.true(atm.processState('000'));
  t.deepEqual(atm.current_state, B500);
});

/**
 * processInformationEntryState()
 */
test('should clear Buffer B while processing information entry state H', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  atm.buffer_B = 'B';
  atm.buffer_C = 'C';
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('buffer_and_display_params', '002');

  t.is(atm.processInformationEntryState(state), undefined);
  t.is(atm.buffer_B, '');
  t.is(atm.buffer_C, 'C');
});

test('should clear Buffer C while processing information entry state H', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  atm.buffer_B = 'B';
  atm.buffer_C = 'C';
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('buffer_and_display_params', '000');

  t.is(atm.processInformationEntryState(state), undefined);
  t.is(atm.buffer_B, 'B');
  t.is(atm.buffer_C, '');
});

test('should show error while processing information entry state H if param is not supported', t => {
  const atm = new ATM(settings, log);
  atm.display.setScreenByNumber = sinon.spy();
  atm.buffer_B = 'B';
  atm.buffer_C = 'C';
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('buffer_and_display_params', '007');
  atm.log.error = sinon.spy();

  t.is(atm.processInformationEntryState(state), undefined);
  t.is(atm.buffer_B, 'B');
  t.is(atm.buffer_C, 'C');
  t.true(atm.log.error.calledWith('Unsupported Display parameter value: 7'));
});


test('should process information entry state H with A button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['A'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '111');
  state.set('FDK_B_next_state', '222');
  state.set('FDK_C_next_state', '255');
  state.set('FDK_D_next_state', '444');

  t.is(atm.processInformationEntryState(state), '111');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process information entry state H with B button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['B'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '111');
  state.set('FDK_B_next_state', '222');
  state.set('FDK_C_next_state', '333');
  state.set('FDK_D_next_state', '255');

  t.is(atm.processInformationEntryState(state), '222');
  t.deepEqual(atm.activeFDKs, ['A', 'B', 'C']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process information entry state H with C button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['C'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '333');
  state.set('FDK_D_next_state', '255');

  t.is(atm.processInformationEntryState(state), '333');
  t.deepEqual(atm.activeFDKs, ['C']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

test('should process information entry state H with D button pressed', t => {
  const atm = new ATM(settings, log);
  atm.buttons_pressed = ['D'];
  atm.display.setScreenByNumber = sinon.spy();
  
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '333');
  state.set('FDK_D_next_state', '444');

  t.is(atm.processInformationEntryState(state), '444');
  t.deepEqual(atm.activeFDKs, ['C', 'D']);
  t.true(atm.display.setScreenByNumber.calledWith('997'));
});

/**
 * processCloseState
 */
test('should process state J', t => {
  const atm = new ATM(settings, log);
  atm.activeFDKs = ['A', 'B', 'C', 'D'];
  atm.card = {
    number: '4444555566667777'
  }; 
  atm.display.setScreenByNumber = sinon.spy();

  let state = new Map(); 
 
  state.set('type', 'J');
  state.set('receipt_delivered_screen', '988');
 
  atm.processCloseState(state);
 
  t.deepEqual(atm.activeFDKs, []);
  t.true(atm.display.setScreenByNumber.calledWith('988'));
  t.is(atm.card, null);
});

/**
 * processStateK()
 */
test('should show error while processing state K if FIT not found', t => {
  const atm = new ATM(settings, log);
  atm.card = {
    number: '4444555566667777'  
  };
  atm.log.error = sinon.spy();
  let state = new Map(); 
 
  state.set('type', 'K');
  state.set('states_to', ['001', '002', '003', '004', '005', '006', '007']);
 
  t.is(atm.processStateK(state), undefined);
  t.true(atm.log.error.calledWith('Unable to get Financial Institution by card number'));
});

test('should return proper state entry while processing state K', t => {
  const atm = new ATM(settings, log);
  atm.card = {
    number: '4188250000000001'  
  };
  let state = new Map(); 
 
  state.set('type', 'K');
  state.set('state_exits', ['001', '002', '003', '004', '005', '006', '007', '008']);

  // FIT record with Institution ID 07 
  t.true(atm.FITs.addFIT('029000065136037255255007000132000015000144000000000000000000000000000000000000000000000000000000000'));
  t.is(atm.processStateK(state), '008');
});

/**
 * processStateW()
 */
test('should process state W', t => {
  const atm = new ATM(settings, log);
  let state = new Map();

  state.set('type', 'W');
  state.set('states', { 
    A: '181', 
    B: '037', 
    C: '255', 
    D: '127', 
    F: '031', 
    G: '034', 
    H: '250', 
    I: '186' 
  });
 
  atm.FDK_buffer = 'A';
  t.is(atm.processStateW(state), '181');
  atm.FDK_buffer = 'B';
  t.is(atm.processStateW(state), '037');
  atm.FDK_buffer = 'C';
  t.is(atm.processStateW(state), '255');
  atm.FDK_buffer = 'D';
  t.is(atm.processStateW(state), '127');
  atm.FDK_buffer = 'F';
  t.is(atm.processStateW(state), '031');
  atm.FDK_buffer = 'G';
  t.is(atm.processStateW(state), '034');
  atm.FDK_buffer = 'H';
  t.is(atm.processStateW(state), '250');
  atm.FDK_buffer = 'I';
  t.is(atm.processStateW(state), '186');
});

/**
 * readCard()
 */
test('should read card', t => {
  const atm = new ATM(settings, log);
  let cardnumber = '4444555566667777';
  let track2_data = '201201211234999';
  atm.log.info = sinon.spy();

  atm.readCard(cardnumber, track2_data);
  t.true(atm.log.info.calledWith('Card ' + cardnumber + ' read'));
  t.true(atm.log.info.calledWith('Track2: ' + cardnumber + '=' + track2_data));
  t.is(atm.status, 'Processing Card');
});

/**
 * processFDKButtonPressed()
 */
test('FDK A should be inactive on state B with PIN less than 4', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
 
  state.set('number', '001');
  state.set('type', 'B');
  state.set('screen_number', '993');
  state.set('remote_pin_check_next_state', '202');

  atm.current_state = state;
  atm.PIN_buffer = '123'; 
  atm.processState = sinon.spy();

  atm.processFDKButtonPressed('A');
  t.true(atm.processState.notCalled);
});

test('should continue with state processing on state B with A button pressed and PIN longer than 3', t => {
  const atm = new ATM(settings, log);
  let state = new Map(); 
 
  state.set('number', '001');
  state.set('type', 'B');
  state.set('screen_number', '993');
  state.set('remote_pin_check_next_state', '202');

  atm.current_state = state;
  atm.PIN_buffer = '1234'; 
  atm.processState = sinon.spy();

  atm.processFDKButtonPressed('A');
  t.true(atm.processState.calledOnce);
});

test('should continue with state processing on state H with enabled button pressed', t => {
  const atm = new ATM(settings, log);
  atm.processState = sinon.spy();
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('number', '200');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '333');
  state.set('FDK_D_next_state', '444');
  atm.current_state = state;

  atm.processFDKButtonPressed('C');
  t.deepEqual(atm.activeFDKs, ['C', 'D']);
  t.true(atm.processState.calledWith('200'));
});

test('should not continue with state processing on state H when disabled button pressed', t => {
  const atm = new ATM(settings, log);
  atm.processState = sinon.spy();
  let state = new Map(); 
 
  state.set('type', 'H');
  state.set('number', '200');
  state.set('screen_number', '997');
  state.set('FDK_A_next_state', '255');
  state.set('FDK_B_next_state', '255');
  state.set('FDK_C_next_state', '255');
  state.set('FDK_D_next_state', '444');
  atm.current_state = state;

  atm.processFDKButtonPressed('A');
  t.deepEqual(atm.activeFDKs, ['D']);
  t.true(atm.processState.notCalled);
});


test('should continue with default state processing', t => {
  const atm = new ATM(settings, log);
  atm.processState = sinon.spy();
  let state = new Map(); 
 
  state.set('type', 'F');
  state.set('number', '202');
  atm.current_state = state;

  atm.processFDKButtonPressed('B');
  t.true(atm.processState.calledWith('202'));
});

/**
 * getBuffer()
 */
test('getBuffer(): should get PIN buffer', t => {
  const atm = new ATM(settings, log);
  let PIN = '12346';
  atm.PIN_buffer = PIN;

  t.is(atm.getBuffer('pin'), PIN);
});


test('getBuffer(): should get buffer B', t => {
  const atm = new ATM(settings, log);
  let buf = 'CBA';
  atm.buffer_B = buf;

  t.is(atm.getBuffer('B'), buf);
});

test('getBuffer(): should get buffer C', t => {
  const atm = new ATM(settings, log);
  let buf = 'DDDDD';
  atm.buffer_C = buf;

  t.is(atm.getBuffer('C'), buf);
});

test('getBuffer(): should get opcode buffer', t => {
  const atm = new ATM(settings, log);
  let buf = 'C  A  BD';
  atm.opcode.buffer = buf;

  t.is(atm.getBuffer('opcode'), buf);
});

test('getBuffer(): should get amount buffer', t => {
  const atm = new ATM(settings, log);
  let amount = '1300';
  atm.amount_buffer = amount;

  t.is(atm.getBuffer('amount'), amount);
});



