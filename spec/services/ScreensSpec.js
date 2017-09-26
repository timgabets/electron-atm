describe("Screens", function() {
  var ScreensService = require('../../src/services/screens.js');
  var log, settings, s;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
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
    it('should get colour control command code 00', function(){
      expect(s.getColourControlCommandCode('00')).toEqual({'blinking': 'off', 'colors': 'default'});
    });

    it('should get colour control command code 10', function(){
      expect(s.getColourControlCommandCode('10')).toEqual({'blinking': 'on'});
    });

    it('should get colour control command code 11', function(){
      expect(s.getColourControlCommandCode('11')).toEqual({'blinking': 'off'});
    });

    it('should get colour control command code 80', function(){
      expect(s.getColourControlCommandCode('80')).toEqual({'background': 'transparent'});
    });

    it('should get colour control command code 20', function(){
      expect(s.getColourControlCommandCode('20')).toEqual({'foreground': 'black'});
    });

    it('should get colour control command code B0', function(){
      expect(s.getColourControlCommandCode('B0')).toEqual({'foreground': 'black'});
    });

    it('should get colour control command code 21', function(){
      expect(s.getColourControlCommandCode('21')).toEqual({'foreground': 'red'});
    });

    it('should get colour control command code B1', function(){
      expect(s.getColourControlCommandCode('B1')).toEqual({'foreground': 'red'});
    });

    it('should get colour control command code 22', function(){
      expect(s.getColourControlCommandCode('22')).toEqual({'foreground': 'green'});
    });

    it('should get colour control command code B2', function(){
      expect(s.getColourControlCommandCode('B2')).toEqual({'foreground': 'green'});
    });

    it('should get colour control command code 23', function(){
      expect(s.getColourControlCommandCode('23')).toEqual({'foreground': 'yellow'});
    });

    it('should get colour control command code B3', function(){
      expect(s.getColourControlCommandCode('B3')).toEqual({'foreground': 'yellow'});
    });

    it('should get colour control command code 24', function(){
      expect(s.getColourControlCommandCode('24')).toEqual({'foreground': 'blue'});
    });

    it('should get colour control command code B4', function(){
      expect(s.getColourControlCommandCode('B4')).toEqual({'foreground': 'blue'});
    });

    it('should get colour control command code 25', function(){
      expect(s.getColourControlCommandCode('25')).toEqual({'foreground': 'magenta'});
    });

    it('should get colour control command code B5', function(){
      expect(s.getColourControlCommandCode('B5')).toEqual({'foreground': 'magenta'});
    });

    it('should get colour control command code 26', function(){
      expect(s.getColourControlCommandCode('26')).toEqual({'foreground': 'cyan'});
    });

    it('should get colour control command code B6', function(){
      expect(s.getColourControlCommandCode('B6')).toEqual({'foreground': 'cyan'});
    });

    it('should get colour control command code 27', function(){
      expect(s.getColourControlCommandCode('27')).toEqual({'foreground': 'white'});
    });

    it('should get colour control command code B7', function(){
      expect(s.getColourControlCommandCode('B7')).toEqual({'foreground': 'white'});
    });


    it('should get colour control command code 30', function(){
      expect(s.getColourControlCommandCode('30')).toEqual({'background': 'black'});
    });

    it('should get colour control command code C0', function(){
      expect(s.getColourControlCommandCode('C0')).toEqual({'background': 'black'});
    });

    it('should get colour control command code 31', function(){
      expect(s.getColourControlCommandCode('31')).toEqual({'background': 'red'});
    });

    it('should get colour control command code C1', function(){
      expect(s.getColourControlCommandCode('C1')).toEqual({'background': 'red'});
    });

    it('should get colour control command code 32', function(){
      expect(s.getColourControlCommandCode('32')).toEqual({'background': 'green'});
    });

    it('should get colour control command code C2', function(){
      expect(s.getColourControlCommandCode('C2')).toEqual({'background': 'green'});
    });

    it('should get colour control command code 33', function(){
      expect(s.getColourControlCommandCode('33')).toEqual({'background': 'yellow'});
    });

    it('should get colour control command code C3', function(){
      expect(s.getColourControlCommandCode('C3')).toEqual({'background': 'yellow'});
    });

    it('should get colour control command code 34', function(){
      expect(s.getColourControlCommandCode('34')).toEqual({'background': 'blue'});
    });

    it('should get colour control command code C4', function(){
      expect(s.getColourControlCommandCode('C4')).toEqual({'background': 'blue'});
    });

    it('should get colour control command code 35', function(){
      expect(s.getColourControlCommandCode('35')).toEqual({'background': 'magenta'});
    });

    it('should get colour control command code C5', function(){
      expect(s.getColourControlCommandCode('C5')).toEqual({'background': 'magenta'});
    });

    it('should get colour control command code 36', function(){
      expect(s.getColourControlCommandCode('36')).toEqual({'background': 'cyan'});
    });

    it('should get colour control command code C6', function(){
      expect(s.getColourControlCommandCode('C6')).toEqual({'background': 'cyan'});
    });

    it('should get colour control command code 37', function(){
      expect(s.getColourControlCommandCode('37')).toEqual({'background': 'white'});
    });

    it('should get colour control command code C7', function(){
      expect(s.getColourControlCommandCode('C7')).toEqual({'background': 'white'});
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
        number: '060',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC060.jpg',
        colour_control_commands: [ {'foreground': 'white'}, {'background': 'transparent'} ],
        insert_screen: '963',
        screen_text: { 
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
          'O': '                                '
        },
        cursor: { 
          'x': 'H', 
          'y': 'H',
        },
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
