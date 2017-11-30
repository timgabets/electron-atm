import test from 'ava';
import CryptoService from '../../src/services/crypto.js';
import Log from 'atm-logging';

// document setup
import { JSDOM } from 'jsdom';
const jsdom = new JSDOM('<!doctype html><html><body><pre id="log-output" class="log-output" type="text"></pre></body></html>');
const { window } = jsdom;

global.window = window;
global.document = window.document;

// settings setup
let storage = {};
const settings = {
  get: function(item) {
    if(storage[item])
      return storage[item];
    else
      return {};
  },
  set: function(item, value){
    storage[item] = value;
  }
};
const log = new Log();

const s = new CryptoService(settings, log);

s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
 
test('should get terminal key', t => {
  t.deepEqual(s.getTerminalKey(), ['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
});


