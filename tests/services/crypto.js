import test from 'ava';
import CryptoService from '../../src/services/crypto.js';
import Log from 'atm-logging';
import sinon from 'sinon';

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

test('should get master key', t => {
  t.deepEqual(s.getMasterKey(), ['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
});

test('should set and store the terminal key', t => {
  settings.set = sinon.spy();

  t.deepEqual(s.getTerminalKey(), ['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
  s.setTerminalKey('B667E96A6D5C961CB667E96A6D5C961C');
  t.deepEqual(s.getTerminalKey(), ['B667E96A6D5C961CB667E96A6D5C961C', '900A01']);
  t.true(settings.set.calledWith('pin_key', 'B667E96A6D5C961CB667E96A6D5C961C'));
});

test('should set and store the master key', t => {
  settings.set = sinon.spy();

  t.deepEqual(s.getMasterKey(), ['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
  s.setMasterKey('D2C4E412AE89A92AD2C4E412AE89A92A');
  t.deepEqual(s.getMasterKey(), ['D2C4E412AE89A92AD2C4E412AE89A92A', '58E506']);
  t.true(settings.set.calledWith('master_key', 'D2C4E412AE89A92AD2C4E412AE89A92A'));
});
 


