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

test('should get terminal key by type', t => {
  t.deepEqual(s.getKey('pin'), ['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
  t.deepEqual(s.getKey('comms'), ['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
});

test('should get master key by type', t => {
  t.deepEqual(s.getKey('master'), ['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
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
 
test('should get the key check value', t => {
  t.is(s.getKeyCheckValue('DEADBEEFDEADBEEFDEADBEEFDEADBEEF'), '2AE358');
});

/**
 * dec2hex()
 */
test('should convert decimal string to hex string', t => {
  t.is(s.dec2hex('040198145193087203201076202216192211251240251237'), '28C691C157CBC94CCAD8C0D3FBF0FBED');
});

test('should convert decimal string to hex string', t => {
  t.is(s.dec2hex('000001002003004005006007008009010011012013014015'), '000102030405060708090A0B0C0D0E0F');
});

/**
 * setCommsKey()
 */

test('should change terminal PIN key', t => {
  s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
  s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
  let data = {
    message_class: 'Data Command',
    LUNO: '000',
    message_sequence_number: '000',
    message_subclass: 'Extended Encryption Key Information',
    modifier: 'Decipher new comms key with current master key',
    new_key_length: '030',
    new_key_data: '040198145193087203201076202216192211251240251237',
  };
  /*
    new_key_data: '040198145193087203201076202216192211251240251237' is decimal representation of 28C691C157CBC94CCAD8C0D3FBF0FBED
    28C691C157CBC94CCAD8C0D3FBF0FBED is 7B278B03B439DDCACF8B3333AC591BCA encrypted under B6D55EABAD23BC4FD558F8D619A21C34.
   */
  t.deepEqual(s.getTerminalKey(), ['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
  t.true(s.setCommsKey(data.new_key_data, data.new_key_length));
  t.deepEqual(s.getTerminalKey(), ['7B278B03B439DDCACF8B3333AC591BCA', '41DD5C']);
});

test('should raise if master key is empty', t => {
  s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
  s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
  let data = {
    message_class: 'Data Command',
    LUNO: '000',
    message_sequence_number: '000',
    message_subclass: 'Extended Encryption Key Information',
    modifier: 'Decipher new comms key with current master key',
    new_key_length: '030',
    new_key_data: '040198145193087203201076202216192211251240251237',
  };
  /*
    new_key_data: '040198145193087203201076202216192211251240251237' is decimal representation of 28C691C157CBC94CCAD8C0D3FBF0FBED
    28C691C157CBC94CCAD8C0D3FBF0FBED is 7B278B03B439DDCACF8B3333AC591BCA encrypted under B6D55EABAD23BC4FD558F8D619A21C34.
   */
  s.setMasterKey(null);
  t.false(s.setCommsKey(data.new_key_data, data.new_key_length));
});

test('should log error in case of key length mismatch', t => {
  log.error = sinon.spy();
  t.false(s.setCommsKey('040198145193087203201076202216192211251240251237', '015'));
  t.true(log.error.calledWith('Key length mismatch. New key has length 32, but expected length is 14'));
});

/**
 * getEncryptedPIN()
 */
test('should get encrypted PIN', t => {
  s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
  t.is(s.getEncryptedPIN('1234', '4000001234562000'), '<3;:1>04=88654<4');
});

test('should return null if no terminal key', t => {
  s.setTerminalKey();
  t.is(s.getEncryptedPIN('1234', '4000001234562000'), null);
});    

test('should format key', t => {
  t.is(s.format('DEADBEEFDEADBEEFDEADBEEFDEADBEEF'), 'DEAD BEEF DEAD BEEF DEAD BEEF DEAD BEEF');
});

