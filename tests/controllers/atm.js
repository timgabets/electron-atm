import test from 'ava';
import Log from 'atm-logging';
import ATM from '../../src/controllers/atm.js';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

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
