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

