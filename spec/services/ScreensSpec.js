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

  describe('getColourControlCommandCode()', function(){
    it('should get colour control command code 27', function(){
      expect(s.getColourControlCommandCode('27')).toEqual('White Foreground');
    });

    it('should get colour control command code 27', function(){
      expect(s.getColourControlCommandCode('80')).toEqual('Transparent Background');
    });
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

    it("should parse Set Cursor Position control", function() {
      var parsed = {
        number: '000',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC000.jpg',
        // row selected first, column selected second
        cursor: { 
          'y': 'F', // Rows
          'x': 'O', // Columns 
        }
      };
      expect(s.parseScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c\x0FFO')).toEqual(parsed);
    });

    it('should parse Screen Blinking and Colour control', function(){
      var parsed = {
        number: '000',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC060.jpg',
        colour_control_commands: [ 'White Foreground', 'Transparent Background' ]
      };
      /*
      0c 1b 50 45 50 49 43 30 36 30 2e 6a 70 67 1b 5c     ..PEPIC060.jpg.\
      1b 5b 32 37 3b 38 30 6d 0f 47 48 0e 39 36 33 20     .[27;80m.GH.963 
      55 53 44 1b 5b 32 37 3b 38 30 6d 0f 48 48           USD.[27;80m.HH
       */
      expect(s.parseScreen('060\x0c\x1bPEPIC060.jpg\x1b\x5c\x1b[27;80m\x0fGH\x0e963USD\x1b[27;80m\x0fHH')).toEqual(parsed);
    });

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
