import test from 'ava';
import StatesHistory from '../../src/services/history.js';

/**
 * get()
 */
test('should return empty states array on init', t => {
  const h = new StatesHistory();
  t.deepEqual(h.get(), []);
});


/**
 * add()
 */
test('should add single state', t => {
  const h = new StatesHistory();
  t.true(h.add('300'));
  t.deepEqual(h.get(), ['300']);
});

test('should add multiple states', t => {
  const h = new StatesHistory();
  t.true(h.add('128'));
  t.true(h.add('444'));
  t.deepEqual(h.get(), ['128', '444']);
});
/*
test('should not add the same state as the last one', t => {
  const h = new StatesHistory();
  t.true(h.add('128'));
  t.true(h.add('444'));
  t.true(h.add('444'));
  t.deepEqual(h.get(), ['128', '444']);
});
*/

test('should use round-robin algorithm while adding new items', t => {
  const h = new StatesHistory();
  t.true(h.add('001'));
  t.true(h.add('002'));
  t.true(h.add('003'));
  t.true(h.add('004'));
  t.true(h.add('005'));
  t.true(h.add('006'));
  t.true(h.add('007'));
  t.true(h.add('008'));
  t.true(h.add('009'));
  t.true(h.add('010'));
  t.deepEqual(h.get(), ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']);

  t.true(h.add('011'));
  t.deepEqual(h.get(), ['002', '003', '004', '005', '006', '007', '008', '009', '010', '011']);
});

test('should create queue with the given size', t => {
  const h = new StatesHistory(3);
  t.true(h.add('001'));
  t.true(h.add('002'));
  t.true(h.add('003'));
  t.deepEqual(h.get(), ['001', '002', '003']);
  t.true(h.add('004'));
  t.deepEqual(h.get(), ['002', '003', '004']);
});
