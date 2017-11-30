import test from 'ava';
import DisplayService from '../../src/services/display.js';
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

const display = new DisplayService(settings, log);

/**
 * setScreen() and getScreen()
 */
test('should set current screen', t => {
  let screen = {
    number: '000',
    actions: [ 
      'clear_screen', 
      Object({ display_image: 'PIC000.jpg' }), 
      Object({ move_cursor: Object({ x: 'O', y: 'F' }) }) 
    ]
  };

  display.setScreen(screen);
  t.is(display.getScreen(), screen);
});

/**
 * getScreenNumber()
 */
test('should get screen number', t => {
  let screen = {
    number: '321',
    actions: [ 
      'clear_screen', 
    ]
  };
  display.setScreen(screen);
  t.is(display.getScreenNumber(), '321');
});

/**
 * insertText()
 */
test('should insert text into left corner', t => {
  let screen = {
    number: '060',
    actions: [ 
      'clear_screen', 
      { add_text: { 
        '@': '                                ', 
        'A': '                                ', 
        'B': '                                ', 
        'C': '                                ', 
        'D': '                                ', 
        'E': '                                ', 
        'F': '                                ', 
        'G': '        USD                     ', 
        'H': '                                ', 
        'I': '                                ', 
        'J': '                                ', 
        'K': '                                ', 
        'L': '                                ', 
        'M': '                                ', 
        'N': '                                ', 
        'O': '                                '} 
      }, 
      { move_cursor: { x: '@', y: '@' } } 
    ]
  };

  display.setScreen(screen);
  let original_text = screen.actions[1]['add_text'];
  t.deepEqual(display.getText(), original_text);
      
  display.insertText('IDDQD');
  t.is(display.getText()['@'], 'IDDQD                           ');
});

test('should insert text into the center of display', t => {
  let screen = {
    number: '060',
    actions: [ 
      'clear_screen', 
      { add_text: { 
        '@': '                                ', 
        'A': '                                ', 
        'B': '                                ', 
        'C': '                                ', 
        'D': '                                ', 
        'E': '                                ', 
        'F': '                                ', 
        'G': '        TEXT                    ', 
        'H': '                                ', 
        'I': '                                ', 
        'J': '                                ', 
        'K': '                                ', 
        'L': '                                ', 
        'M': '                                ', 
        'N': '                                ', 
        'O': '                                '} 
      }, 
      { move_cursor: { x: 'E', y: 'F' } } 
    ]
  };

  display.setScreen(screen);
  let original_text = screen.actions[1]['add_text'];
  t.deepEqual(display.getText(), original_text);
      
  display.insertText('LEGIO PATRIA NOSTRA');
  t.is(display.getText()['F'], '     LEGIO PATRIA NOSTRA        ');
});

test('should insert masked text', t => {
  let screen = {
    number: '060',
    actions: [ 
      'clear_screen', 
      { add_text: { 
        '@': '                                ', 
        'A': '                                ', 
        'B': '                                ', 
        'C': '                                ', 
        'D': '                                ', 
        'E': '                                ', 
        'F': '                                ', 
        'G': '                                ', 
        'H': '                                ', 
        'I': '                                ', 
        'J': '                                ', 
        'K': '                                ', 
        'L': '                                ', 
        'M': '                                ', 
        'N': '                                ', 
        'O': '                                '} 
      }, 
      { move_cursor: { x: '5', y: 'G' } } 
    ]
  };

  display.setScreen(screen);
  let original_text = screen.actions[1]['add_text'];
  t.deepEqual(display.getText(), original_text);
      
  display.insertText('IDDQD', '*');
  t.is(display.getText()['G'], '                     *****      ');
});

