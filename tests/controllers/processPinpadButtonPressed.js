import test from 'ava';
import Log from 'atm-logging';
import ATM from '../../src/controllers/atm.js';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

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


test('should put the entered numbers into PIN buffer', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;
  atm.card = {number: '8888999900001111'};

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('5');

  t.is(atm.PIN_buffer, '1985');
});

test('should properly handle pressed Backspace button', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('3');

  t.is(atm.PIN_buffer, '5893');
});

test('should properly handle pressed Enter button', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('3');

  t.is(atm.PIN_buffer, '5893');
  t.true(atm.processState.notCalled);
});

test('should call processState() when 6 digits entered', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('3');

  t.is(atm.PIN_buffer, '198593');
  t.true(atm.processState.calledOnce);
});

test('should call processState() when 4 digits PIN entered + Enter button pressed', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('enter');

  t.is(atm.PIN_buffer, '9855');
  t.true(atm.processState.calledOnce);
});

test('should not call processState() when PIN buffer is less than 4', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('enter');
  atm.processPinpadButtonPressed('enter');
  atm.processPinpadButtonPressed('enter');

  t.is(atm.PIN_buffer, '1');
  t.true(atm.processState.notCalled);
});

test('should clear PIN Buffer when Esc pressed', t => {
  let state = new Map();
  state.set('number', '230');
  state.set('type', 'B');
  atm.current_state = state;

  atm.max_pin_length = 6;
  atm.initBuffers();
  atm.processState = sinon.spy();

  t.is(atm.PIN_buffer, '');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('esc');

  t.is(atm.PIN_buffer, '');
  t.true(atm.processState.notCalled);
});

/**
 * describe("processPinpadButtonPressed() for state F', t => {
 */
test('should put the entered numbers into amount buffer', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'F');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();

  t.is(atm.amount_buffer, '000000000000');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('5');

  t.is(atm.amount_buffer, '000000001985');
});

test('should properly handle pressed Backspace button', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'F');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();

  t.is(atm.amount_buffer, '000000000000');
      
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('3');

  t.is(atm.amount_buffer, '000000005893');
});

test('should properly handle pressed Enter button', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'F');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();
  
  t.is(atm.amount_buffer, '000000000000');
    
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('enter');

  t.is(atm.amount_buffer, '000000009855');
  t.true(atm.processState.calledOnce);
});

test('should not overflow amount buffer', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'F');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();
  t.is(atm.amount_buffer, '000000000000');
      
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');

  t.is(atm.amount_buffer, '345678901234');
});

/**
 * "processPinpadButtonPressed() for state H
*/
test('should put the entered numbers into buffer C', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '000'); // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer C
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.display.insertText = sinon.spy();
  atm.initBuffers();
 
  t.is(atm.buffer_C, '');

  atm.processPinpadButtonPressed('1');
  t.true(atm.display.insertText.calledWith('1', 'X'));
  atm.processPinpadButtonPressed('9');
  t.true(atm.display.insertText.calledWith('19', 'X'));
  atm.processPinpadButtonPressed('8');
  t.true(atm.display.insertText.calledWith('198', 'X'));
  atm.processPinpadButtonPressed('5');
  t.true(atm.display.insertText.calledWith('1985', 'X'));

  t.is(atm.buffer_C, '1985');
});

test('should properly handle pressed Backspace button', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '000'); // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer C
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();
  t.is(atm.buffer_C, '');
      
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('backspace');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('3');

  t.is(atm.buffer_C, '5893');
});

test('should put the entered numbers into buffer C when buffer_and_display_params = 001', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '001');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.display.insertText = sinon.spy();
  atm.initBuffers();
  
  t.is(atm.buffer_C, '');

  atm.processPinpadButtonPressed('7');
  t.true(atm.display.insertText.calledWith('7'));
  atm.processPinpadButtonPressed('9');
  t.true(atm.display.insertText.calledWith('79'));
  atm.processPinpadButtonPressed('8');
  t.true(atm.display.insertText.calledWith('798'));
  atm.processPinpadButtonPressed('backspace');
  t.true(atm.display.insertText.calledWith('79'));
  atm.processPinpadButtonPressed('4');
  t.true(atm.display.insertText.calledWith('794'));

  t.is(atm.buffer_C, '794');
});

test('should put the entered numbers into buffer B when buffer_and_display_params = 002', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '002');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.display.insertText = sinon.spy();
  atm.initBuffers();
 
  t.is(atm.buffer_B, '');

  atm.processPinpadButtonPressed('7');
  t.true(atm.display.insertText.calledWith('7', 'X'));
  atm.processPinpadButtonPressed('9');
  t.true(atm.display.insertText.calledWith('79', 'X'));
  atm.processPinpadButtonPressed('8');
  t.true(atm.display.insertText.calledWith('798', 'X'));
  atm.processPinpadButtonPressed('4');
  t.true(atm.display.insertText.calledWith('7984', 'X'));

  t.is(atm.buffer_B, '7984');
});

test('should put the entered numbers into buffer B when buffer_and_display_params = 003', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '003');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.display.insertText = sinon.spy();
  atm.initBuffers();
  
  t.is(atm.buffer_B, '');

  atm.processPinpadButtonPressed('7');
  t.true(atm.display.insertText.calledWith('7'));
  atm.processPinpadButtonPressed('backspace');
  t.true(atm.display.insertText.calledWith(''));
  atm.processPinpadButtonPressed('9');
  t.true(atm.display.insertText.calledWith('9'));
  atm.processPinpadButtonPressed('8');
  t.true(atm.display.insertText.calledWith('98'));
  atm.processPinpadButtonPressed('4');
  t.true(atm.display.insertText.calledWith('984'));
  atm.processPinpadButtonPressed('4');
  t.true(atm.display.insertText.calledWith('9844'));
  atm.processPinpadButtonPressed('0');
  t.true(atm.display.insertText.calledWith('98440'));

  t.is(atm.buffer_B, '98440');
});


test('should not overflow buffer C (32 bytes max)', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '001');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();

  t.is(atm.buffer_C, '');

  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 10
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 20
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 30
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  // 32. The rest must be trimmed
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');

  t.is(atm.buffer_C, '12345678901234567890123456789012');
});

test('should not overflow buffer B (32 bytes max)', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '003');
  atm.current_state = state;
  atm.processState = sinon.spy();
  atm.initBuffers();
 
  t.is(atm.buffer_B, '');

  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 10
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 20
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  atm.processPinpadButtonPressed('3');
  atm.processPinpadButtonPressed('4');
  atm.processPinpadButtonPressed('5');
  atm.processPinpadButtonPressed('6');
  atm.processPinpadButtonPressed('7');
  atm.processPinpadButtonPressed('8');
  atm.processPinpadButtonPressed('9');
  atm.processPinpadButtonPressed('0');
  // 30
  atm.processPinpadButtonPressed('1');
  atm.processPinpadButtonPressed('2');
  // 32. The rest must be trimmed
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');
  atm.processPinpadButtonPressed('0');

  t.is(atm.buffer_B, '12345678901234567890123456789012');
});


test('should log error when no keyboard entry allowed', t => {
  let state = new Map();
  state.set('number', '300');
  state.set('type', 'I');
  atm.current_state = state;
  atm.log.error = sinon.spy();
 
  atm.processPinpadButtonPressed('2');
  t.true(atm.log.error.calledWith('No keyboard entry allowed for state type I'));
});

test('should log error when unsupported buffer parameter passed', t => {
  let state = new Map();
  state.set('number', '700');
  state.set('type', 'H');
  state.set('FDK_A_next_state', '001');
  state.set('FDK_B_next_state', '002');
  state.set('FDK_C_next_state', '003');
  state.set('FDK_D_next_state', '004');
  state.set('buffer_and_display_params', '009');
  atm.current_state = state;
  atm.log.error = sinon.spy();
  atm.initBuffers();
 
  atm.processPinpadButtonPressed('1');
  t.true(atm.log.error.calledWith('Unsupported Display parameter value: 9'));
}); 

