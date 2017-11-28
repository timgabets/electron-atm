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
const atm = new ATM(settings, log);

test('should pass dummy test', t => {
  t.is(true, true);
});

test('should init terminal buffers', t => {
  t.is(atm.initBuffers(), true);
  t.is(atm.PIN_buffer, '');
  t.is(atm.buffer_B, '');
  t.is(atm.buffer_C, '');
  t.is(atm.amount_buffer, '000000000000');
  t.is(atm.opcode.getBuffer(), '        ');
  t.is(atm.FDK_buffer, '');
});
 

