import test from 'ava';
import CardsService from '../../src/services/cards.js';

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

const s = new CardsService(settings, log);


test('dummy ', t => {
  t.is(true, true);
});

/**
 *   describe('getPaymentScheme()', t => {
 */
test('should get AMEX 34 payment scheme', t => {
  t.is(s.getPaymentScheme('34'), 'AMEX');
});

test('should not resolve 3527', t => {
  t.is(s.getPaymentScheme('3527'), undefined);
});        

test('should resolve 3528 as JSB Payment scheme', t => {
  t.is(s.getPaymentScheme('3528'), 'JCB');
});    

test('should resolve 3555 as JSB Payment scheme', t => {
  t.is(s.getPaymentScheme('3555'), 'JCB');
});  

test('should resolve 3589 as JSB Payment scheme', t => {
  t.is(s.getPaymentScheme('3589'), 'JCB');
});  

test('should resolve 3589 as JSB Payment scheme', t => {
  t.is(s.getPaymentScheme('3590'), undefined);
});  

test('should get AMEX 37 payment scheme', t => {
  t.is(s.getPaymentScheme('37'), 'AMEX');
});

test('should resolve 50 as Maestro', t => {
  t.is(s.getPaymentScheme('50'), 'Maestro');
});

test('should resolve 51 as Mastercard', t => {
  t.is(s.getPaymentScheme('51'), 'Mastercard');
});

test('should resolve 52 as Mastercard', t => {
  t.is(s.getPaymentScheme('52'), 'Mastercard');
});

test('should resolve 53 as Mastercard', t => {
  t.is(s.getPaymentScheme('53'), 'Mastercard');
});

test('should resolve 54 as Mastercard', t => {
  t.is(s.getPaymentScheme('54'), 'Mastercard');
});

test('should resolve 55 as Mastercard', t => {
  t.is(s.getPaymentScheme('55'), 'Mastercard');
});

test('should resolve 56 as Maestro', t => {
  t.is(s.getPaymentScheme('56'), 'Maestro');
});

test('should resolve 57 as Maestro', t => {
  t.is(s.getPaymentScheme('57'), 'Maestro');
});

test('should resolve 58 as Maestro', t => {
  t.is(s.getPaymentScheme('58'), 'Maestro');
});

test('should get Mastercard payment scheme', t => {
  t.is(s.getPaymentScheme('62'), 'CUP');
});

test('should get Discover 64 payment scheme', t => {
  t.is(s.getPaymentScheme('64'), 'Discover');
});

test('should get Discover 65 payment scheme', t => {
  t.is(s.getPaymentScheme('65'), 'Discover');
});

test('should resolve 4 as VISA', t => {
  t.is(s.getPaymentScheme('4'), 'VISA');
});    

test('should resolve 40 as VISA', t => {
  t.is(s.getPaymentScheme('40'), 'VISA');
});    

test('should resolve 49 as VISA', t => {
  t.is(s.getPaymentScheme('49'), 'VISA');
});    

/**
 * describe('add()', t => {
 */
test('should add a card', t => {
  let card = {
    number: '4444555566667777',
    expiry_date: '1212',
    service_code: '101',
    pvki: '1',
    pvv: '1234',
    cvv: '567',
    discretionary_data: '00001'
  };
  settings.set = sinon.spy();

  t.true(s.add(card), true);
  t.true(settings.set.calledOnce);
  t.is(s.get('4444555566667777'), card);
  t.is(s.get('4444 5555 6666 7777'), card);
  t.is(s.get('4444555566667777').scheme, 'VISA');
  t.is(s.get('4444555566667777').name, '4444 5555 6666 7777');
});

test('should add a card with decorated card number', t => {
  let original = {number: '5555 0000 1123 4566'};
  let saved = {
    number: '5555000011234566',
    name: '5555 0000 1123 4566',
    scheme: 'Mastercard',
  };

  settings.set = sinon.spy();

  t.true(s.add(original));
  t.true(settings.set.calledOnce);
  t.deepEqual(s.get('5555000011234566'), saved);
  t.deepEqual(s.get('5555 0000 1123 4566'), saved);
  t.is(s.get('5555000011234566').name, '5555 0000 1123 4566');
});

test('should add a card without name', t => {
  let card = {
    number: '4444555566667777',
    expiry_date: '1212',
    service_code: '101',
    pvki: '1',
    pvv: '1234',
    cvv: '567'
  };
  settings.set = sinon.spy();

  t.true(s.add(card));
  t.true(settings.set.calledOnce);
  t.is(s.get('4444555566667777'), card);
});

/**
 * describe('getNames()', t => {
 */
test('should return empty array if there is no cards', t => {
  const n = new CardsService(settings, log);
  t.deepEqual(n.cards, {});

  t.true(n.add({number: '1111111111111111'}));
  t.true(n.add({number: '2222222222222222'}));
  t.deepEqual(n.getNames(), ['1111111111111111', '2222222222222222']);
});

/**
 * describe('getTrack2()', t => {
 */
test('should return empty array if there is no cards', t => {
  let card = {
    number: '4444555566667777',
    expiry_date: '1212',
    service_code: '101',
    pvki: '1',
    pvv: '1234',
    cvv: '567',
    discretionary_data: '00001'
  };

  t.is(s.getTrack2(card), '12121011123456700001');
});

/**
 * describe('decorateCardNumber()', t => {
 */
test('should not decorate empty cardnumber', t => {
  t.is(s.decorateCardNumber(''), '');
});

test('should decorate cardnumber', t => {
  t.is(s.decorateCardNumber('1111222233334444'), '1111 2222 3333 4444');
});

test('should not decorate already decorated card number',  t => {
  t.is(s.decorateCardNumber('1111 2222 3333 4444'), '1111 2222 3333 4444');
});

test('should not decorate cardnumber with inserted char in the middle',  t => {
  t.is(s.decorateCardNumber('11181 2222 3333 444'), '1118 1222 2333 3444');
});

/**
 * describe('remove()', t => {
 */
test('should remove card', t => {
  const n = new CardsService(settings, log);
  t.deepEqual(n.cards, {});

  t.true(n.add({number: '1111111111111111'}));
  t.true(n.add({number: '2222222222222222'}));

  t.deepEqual(n.getNames(), ['1111111111111111', '2222222222222222']);
  n.remove('1111111111111111');
  t.deepEqual(n.getNames(), ['2222222222222222']);
  t.deepEqual(n.get('1111111111111111'), undefined);
});
