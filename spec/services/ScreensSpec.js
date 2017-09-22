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

  describe('initCursor()', function(){
    it('should init cursor position', function(){
      s.initCursor();
      expect(s.cursor_position).toEqual({'x': 0, 'y': 0});
    })
  });

  describe('getCursorPosition()', function(){
    it('should get left top cursor position', function(){
      s.initCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
    })

    it('should get right top cursor position', function(){
      s.cursor_position = {'x': 31, 'y': 0};
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': '@'});
    })

    it('should get bottom left cursor position', function(){
      s.cursor_position = {'x': 0, 'y': 15};
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': 'O'});
    })

    it('should get bottom right cursor position', function(){
      s.cursor_position = {'x': 31, 'y': 15};
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
    })

    it('should get center cursor position', function(){
      s.cursor_position = {'x': 15, 'y': 7};
      expect(s.getCursorPosition()).toEqual({'x': 'O', 'y': 'G'});
    })
  });

  describe('moveCursor()', function(){
    it('should move cursor position one character right', function(){
      s.initCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.moveCursor();
      expect(s.getCursorPosition()).toEqual({'x': 'A', 'y': '@'});
    })

    it('should move cursor position five characters right', function(){
      s.initCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.moveCursor(5);
      expect(s.getCursorPosition()).toEqual({'x': 'E', 'y': '@'});
    })

    it('should move cursor to the end of top line', function(){
      s.initCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.moveCursor(31);
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': '@'});
    })

    it('should move cursor position to the next line', function(){
      s.initCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
      s.moveCursor(32);
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': 'A'});
    })

    it('should move cursor to the bottom right in case of very large value', function(){
      s.initCursor();
      s.moveCursor(600);
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
    })

    it('should move cursor position to the next line', function(){
      s.initCursor();
      s.cursor_position = {'x': 31, 'y': 7};
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': 'G'});
      s.moveCursor();
      expect(s.getCursorPosition()).toEqual({'x': '@', 'y': 'H'});
    })

    it('should not move cursor if already in bottom right corner', function(){
      s.initCursor();
      s.cursor_position = {'x': 31, 'y': 15};
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
      s.moveCursor();
      expect(s.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
    })    
  
  });

  describe('initScreenText()', function(){
    it('should init screen text', function() {
      var initialized = { '@': '', 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '', 'H': '', 'I': '', 'J': '', 'K': '', 'L': '', 'M': '', 'N': '', 'O': '' };
      expect(s.screen_text).toEqual({});
      s.initScreenText()
      expect(s.screen_text).toEqual(initialized);
    });
  });

/*

  describe('addScreenText()', function(){
    it('should add one character', function() {
      s.initScreenText()
      expect(s.cursor_position).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('X');
      expect(s.screen_text['@']).toEqual('X')
    });

    it('should change sursor position', function() {
      s.initScreenText()
      expect(s.cursor_position).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('X');
      expect(s.cursor_position).toEqual({'x': 'A', 'y': '@'})
    });

    it('should add short character string', function() {
      s.initScreenText()
      expect(s.cursor_position).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('IDDQD');
      expect(s.screen_text['@']).toEqual('IDDQD')
    });
  });
*/
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

/*
    it("should clear screen and put the text", function() {
      var parsed = {
        number: '039',
        clear_screen: true,
        text: {
          '@': 'TEXT',
        }
      };
      expect(s.parseScreen('039\x0cTEXT')).toEqual(parsed);
    });

    it("should parse Display Image File control", function() {
      var parsed = {
        number: '000',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC000.jpg',
      };
      expect(s.parseScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c')).toEqual(parsed);
    });

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
/*
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
*/

  describe('parseDynamicScreenData()', function(){
    /*
    12:01:47.874<< 84 bytes received:
      00 52 33 30 1c 30 30 30 1c 30 30 30 1c 32 31 30         .R30.000.000.210
      31 30 30 30 31 30 30 30 30 1c 30 33 37 1c 0c 0c         100010000.037...
      1b 50 45 50 49 43 32 33 35 2e 6a 70 67 1b 5c 1b         .PEPIC235.jpg.\.
      5b 32 37 3b 38 30 6d 1b 28 76 1b 29 76 0f 46 4b         [27;80m.(v.)v.FK
      20 20 20 20 20 20 20 20 20 20 20 20 20 20 43 4f                       CO
      55 50 4f 4e                                             UPON
    it('should parse', function(){
      var parsed = {
        number: 'DYNAMIC',
        display_image_files_control: true,
        image_file: 'PIC235.jpg',
      };
      expect(s.parseDynamicScreenData('\x1BPEPIC235.jpg\x1B\\x1B[27;80m\x1B(v\x1B)v\x0FFK              COUPON')).toEqual(parsed);
    })
   */
  });

});
