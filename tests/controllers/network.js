import test from 'ava';
import Network from '../../src/controllers/network.js';
import Log from 'atm-logging';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

const jsdom = new JSDOM('<!doctype html><html><body><pre id="log-output" class="log-output" type="text"></pre></body></html>');
const { window } = jsdom;

global.window = window;
global.document = window.document;

const log = new Log();
const n = new Network(undefined, log);
n.client = {
  write: function(data){
    return true;
  },
  end: function(data){
    return true;
  },
  
};
 
test('should return true', t => {
  t.is(true, true);
});

test('should be able to get proper empty message length', t => {
  t.is(n.getOutgoingMessageLength(''), '\x00\x00');
});
    
test('should return the length for message.len === 10', t => {
  t.is(n.getOutgoingMessageLength('0123456789'), '\x00\x0a');
});
    
test('should return the length for message.len === 16', t => {
  t.is(n.getOutgoingMessageLength('0123456789abcdef'), '\x00\x10');
});

test('should return the length for message.len === 255', t => {
  t.is(n.getOutgoingMessageLength('123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'), '\x00\xff');
});

test('should return the length for message.len === 256', t => {
  t.is(n.getOutgoingMessageLength('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'), '\x01\x00');
});
     
test('should return the length for message.len === 2636', t => {
  t.is(n.getOutgoingMessageLength('0123456789abcdef012340123456789abcdef01234567889abcdef01289abcdef01289abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567893456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567893456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567899abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef567889abcdef01289abcdef01289abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567893456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567893456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567899abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'), '\x0a\x4c');
});

test('should send and trace the data', t => {
  n.client.write = sinon.spy();
  n.trace.trace = sinon.spy();

  n.send('iddqd');

  t.true(n.client.write.calledOnce);
  t.true(n.trace.trace.calledOnce);
});

test('toggleConnect(): should disconnect if already connected', t => {
  n.client.end = sinon.spy();
  
  n.isConnected = true;
  n.toggleConnect();
  t.true(n.client.end.calledOnce);
});

test('toggleConnect(): should try to connect if not yet connected', t => {
  n.client.end = sinon.spy();
  
  n.isConnected = false;
  n.toggleConnect('127.0.0.1', '0');
  //t.true(n.client.end.calledOnce);
});
