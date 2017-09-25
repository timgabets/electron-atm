describe("Screens", function() {
  var ScreensService = require('../../src/services/screens.js');
  var log, settings, s;

  beforeEach(function() {
    log = {
      info: function() {
      }
    };
    
    settings = {
      get: function(value) {
        return {};
      },
      set: function(value){
      }
    };

    spyOn(settings, 'set');

    s = new ScreensService(settings, log);
  });

  describe('initScreenText()', function(){
    it('should init screen text', function() {
      var initialized = { 
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
        'O': '                                ' };
      expect(s.screen_text).toEqual({});
      s.initScreenText()
      expect(s.screen_text).toEqual(initialized);
    });
  });

  describe('replaceCharAt()', function(){
    it('should replace symbol in string', function(){
      expect(s.replaceCharAt('iddqd', 1, 'x')).toEqual('ixdqd');
    });

    it('should replace symbol in string', function(){
      expect(s.replaceCharAt('                                ', 0, 'X')).toEqual('X                               ');
    });
  });

  describe('addScreenText()', function(){
    beforeEach(function() {
      s.cursor.initCursor();
      s.initScreenText();
    });

    it('should add one character', function() {
      expect(s.screen_text['@'].length).toEqual(32);
      s.addScreenText('X');
      expect(s.screen_text['@'].length).toEqual(32);
      expect(s.screen_text['@']).toEqual('X                               ')
    });

    it('should replace the character', function() {
      s.addScreenText('X');
      expect(s.screen_text['@']).toEqual('X                               ')
      s.cursor.initCursor();
      s.addScreenText('Z');
      expect(s.screen_text['@']).toEqual('Z                               ')
    });

    it('should change cursor position', function() {
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('X');
      expect(s.getCursorPosition()).toEqual({'x': 'A', 'y': '@'})
    });

    it('should add short character string', function() {
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('IDDQD');
      expect(s.screen_text['@']).toEqual('IDDQD                           ')
      expect(s.getCursorPosition()).toEqual({'x': 'E', 'y': '@'});
    });

    it('should replace previous character string', function() {
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('IDDQD');
      expect(s.screen_text['@']).toEqual('IDDQD                           ')
      
      s.cursor.initCursor();
      s.addScreenText('XYZ');
      expect(s.screen_text['@']).toEqual('XYZQD                           ')
    });

    it('should carry the text to the next line', function() {
      s.cursor.cursor_position = {'x': 30, 'y': 0}
      expect(s.getCursorPosition()).toEqual({'x': '>', 'y': '@'});
      s.addScreenText('ABCDEFGHI');
      expect(s.screen_text['@']).toEqual('                              AB')
      expect(s.screen_text['A']).toEqual('CDEFGHI                         ')
      expect(s.getCursorPosition()).toEqual({'x': 'G', 'y': 'A'});
    });
  });
  
  describe('screenTextEmpty()', function(){
    it('should return true is text screen is empty', function(){
      s.initScreenText();
      expect(s.screenTextEmpty()).toBeTruthy();
    });

    it('should return false if the text screen is changed', function(){
      s.initScreenText();
      s.screen_text['A'] = 'IDDQD                           ';
      expect(s.screenTextEmpty()).toBeFalsy();
    })
  });

  describe("parseScreen()", function(){
    it("should return empty object on empty string", function() {
      expect(s.parseScreen('')).toBeFalsy();
    });

    it("should parse screen number", function() {
      var parsed = {
        number: '778',
      };
      expect(s.parseScreen('778')).toEqual(parsed);
    });

    it("should clear screen and put the text", function() {
      var parsed = {
        number: '039',
        clear_screen: true,
        screen_text: { 
          '@': 'TEXT                            ', 
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
          'O': '                                '
        },
        cursor: { x: 'D', y: '@' }
      };
      expect(s.parseScreen('039\x0cTEXT')).toEqual(parsed);
    });

    it("should parse Display Image File control", function() {
      var parsed = {
        number: '000',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC000.jpg',
        cursor: { 'x': '@', 'y': '@' }
      };
      expect(s.parseScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c')).toEqual(parsed);
    });

/*
    it("should parse Screen Blinking and Colour control", function() {
      var parsed = {
        number: '039',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC039.jpg',
      };
      expect(s.parseScreen('039\x0c\x1bPEPIC039.jpg\x1b\x5c\x1b[27;80m')).toEqual(parsed);
    });
*/    
  });
  describe("addScreen()", function(){
    it("should not add invalid screen", function() {
      expect(s.addScreen('')).toBeFalsy();
      expect(settings.set).not.toHaveBeenCalled();
    });

    it("should add valid screen", function() {
      expect(s.addScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c')).toBeTruthy();
      expect(settings.set).toHaveBeenCalled();
    });
  });

  describe("add()", function(){
    it("should not add screens", function() {
      screens = [];
      expect(s.add(screens)).toBeTruthy();
    });
  });

  describe('parseDynamicScreenData()', function(){
    it('should parse dynamic screen', function(){
      var parsed = {
        number: 'DYNAMIC',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC235.jpg',
        screen_text: { 
          '@': '                                ', 
          'A': '                                ', 
          'B': '                                ', 
          'C': '                                ', 
          'D': '                                ', 
          'E': '                                ', 
          'F': '                         COUPON ', 
          'G': '                                ', 
          'H': '                                ', 
          'I': '                                ', 
          'J': '                                ', 
          'K': '                                ', 
          'L': '                                ', 
          'M': '                                ', 
          'N': '                                ', 
          'O': '                                '
        },
        cursor: { 'x': '?', 'y': 'F' },
      };
      expect(s.parseDynamicScreenData('\x0c\x0c\x1BPEPIC235.jpg\x1b\x5c\x0FFK              COUPON')).toEqual(parsed);
    })
  });

});
