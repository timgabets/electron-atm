import test from 'ava';
import Log from 'atm-logging';
import ATM from '../../src/controllers/atm.js';
import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body><pre id="log-output" class="log-output" type="text"></pre></body></html>');
const { window } = jsdom;

global.window = window;
global.document = window.document;

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
let atm = new ATM(settings, log);

atm.transaction_request = null;
atm.opcode.set('ZZZZZZZZ');
atm.track2 = '8990011234567890=20062011987612300720';
atm.amount_buffer = '000000001337';
atm.buffer_B = 'XZXZXZXZXZX';
atm.buffer_C = '19671994';
      
// PIN block related data
atm.PIN_buffer = '1234';
atm.card = {number: '4000001234562000'};
atm.crypto.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
 
/**
 * describe("processTransactionRequestState()', t => {
 */
test('should properly fill transaction request data when send_operation_code is enabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_operation_code', '001');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.opcode_buffer, atm.opcode.getBuffer());
});

test('should properly fill transaction request data when send_operation_code is disabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_operation_code', '000');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.opcode_buffer, undefined);
});

test('should properly fill transaction request data when send_track2 is enabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_track2', '001');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.track2, atm.track2);
});

test('should properly fill transaction request data when send_track2 is disabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_track2', '000');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.track2, undefined);
});

test('should properly fill transaction request data when send_amount_data is enabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_amount_data', '001');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.amount_buffer, atm.amount_buffer);
});

test('should properly fill transaction request data when send_amount_data is disabled', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_amount_data', '000');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.amount_buffer, undefined);
});

test('should properly fill transaction request data when send_pin_buffer is disabled (Standard format)', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_pin_buffer', '000');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.PIN_buffer, undefined);
});

test('should properly fill transaction request data when send_pin_buffer is enabled (Standard format)', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_pin_buffer', '001');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.PIN_buffer.length, 16);
});

test('should properly fill transaction request data when send_pin_buffer is disabled (Extended format)', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_pin_buffer', '128');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.PIN_buffer, undefined);
});

test('should properly fill transaction request data when send_pin_buffer is enabled (Extended format)', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_pin_buffer', '129');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.PIN_buffer.length, 16);
});

test('should properly fill transaction request data when send_buffer_B_buffer_C is 000', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_buffer_B_buffer_C', '000');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.buffer_B, undefined);
  t.is(atm.transaction_request.buffer_C, undefined);
});

test('should properly fill transaction request data when send_buffer_B_buffer_C is 001', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_buffer_B_buffer_C', '001');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.buffer_B, atm.buffer_B);
  t.is(atm.transaction_request.buffer_C, undefined);
});

test('should properly fill transaction request data when send_buffer_B_buffer_C is 002', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_buffer_B_buffer_C', '002');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.buffer_B, undefined);
  t.is(atm.transaction_request.buffer_C, atm.buffer_C);
});

test('should properly fill transaction request data when send_buffer_B_buffer_C is 003', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');
  state.set('send_buffer_B_buffer_C', '003');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.buffer_B, atm.buffer_B);
  t.is(atm.transaction_request.buffer_C, atm.buffer_C);
});

test('should create Unsolicited Transaction Request message object', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');

  atm.processTransactionRequestState(state);
  t.is(atm.transaction_request.message_class, 'Unsolicited');
  t.is(atm.transaction_request.message_subclass, 'Transaction Request');
});

/**
 * Interactive Transaction processing
 */
test('should process interactive transaction and store pressed button in buffer B', t => {
  let state = new Map();
  state.set('number', '027');
  state.set('type', 'I');

  atm.interactive_transaction = true;
  atm.buttons_pressed = ['F'];
  atm.activeFDKs = ['F'];
  atm.processTransactionRequestState(state);

  t.is(atm.transaction_request.message_class, 'Unsolicited');
  t.is(atm.transaction_request.message_subclass, 'Transaction Request');
  t.false(atm.interactive_transaction);
  t.is(atm.buffer_B, 'F');
});
