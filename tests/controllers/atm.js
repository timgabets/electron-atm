import test from 'ava';
import Log from 'atm-logging';
import ATM from '../../src/controllers/atm.js';
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
 * describe('parseTrack2()', t =>{
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
 * describe('processHostMessage()', t =>{
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
test('should return undefined if button value is not provided', t =>{
  const atm = new ATM(settings, log);
  t.is(atm.isFDKButtonActive(), undefined);
});

test('should perform case-insensitive check through active FDKs', t =>{
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
 * describe("setAmountBuffer()', t =>{
 */
test('should set amount buffer', t =>{
  const atm = new ATM(settings, log);
  t.is(atm.amount_buffer, '000000000000');
  atm.setAmountBuffer('15067');
  t.is(atm.amount_buffer, '000000015067');
});

test('should leave amount buffer unchanged if no value provided', t =>{
  const atm = new ATM(settings, log);
  t.is(atm.amount_buffer, '000000000000');
  atm.setAmountBuffer('15067');
  t.is(atm.amount_buffer, '000000015067');
  atm.setAmountBuffer();
  t.is(atm.amount_buffer, '000000015067');
});


