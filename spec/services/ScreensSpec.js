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
      expect(s.getColourControlCommandCode('00')).toEqual({'set_blinking': 'off', 'colors': 'default'});
    });

    it('should get colour control command code 10', function(){
      expect(s.getColourControlCommandCode('10')).toEqual({'set_blinking': 'on'});
    });

    it('should get colour control command code 11', function(){
      expect(s.getColourControlCommandCode('11')).toEqual({'set_blinking': 'off'});
    });

    it('should get colour control command code 80', function(){
      expect(s.getColourControlCommandCode('80')).toEqual({'set_background_color': 'transparent'});
    });

    it('should get colour control command code 20', function(){
      expect(s.getColourControlCommandCode('20')).toEqual({'set_font_color': 'black'});
    });

    it('should get colour control command code B0', function(){
      expect(s.getColourControlCommandCode('B0')).toEqual({'set_font_color': 'black'});
    });

    it('should get colour control command code 21', function(){
      expect(s.getColourControlCommandCode('21')).toEqual({'set_font_color': 'red'});
    });

    it('should get colour control command code B1', function(){
      expect(s.getColourControlCommandCode('B1')).toEqual({'set_font_color': 'red'});
    });

    it('should get colour control command code 22', function(){
      expect(s.getColourControlCommandCode('22')).toEqual({'set_font_color': 'green'});
    });

    it('should get colour control command code B2', function(){
      expect(s.getColourControlCommandCode('B2')).toEqual({'set_font_color': 'green'});
    });

    it('should get colour control command code 23', function(){
      expect(s.getColourControlCommandCode('23')).toEqual({'set_font_color': 'yellow'});
    });

    it('should get colour control command code B3', function(){
      expect(s.getColourControlCommandCode('B3')).toEqual({'set_font_color': 'yellow'});
    });

    it('should get colour control command code 24', function(){
      expect(s.getColourControlCommandCode('24')).toEqual({'set_font_color': 'blue'});
    });

    it('should get colour control command code B4', function(){
      expect(s.getColourControlCommandCode('B4')).toEqual({'set_font_color': 'blue'});
    });

    it('should get colour control command code 25', function(){
      expect(s.getColourControlCommandCode('25')).toEqual({'set_font_color': 'magenta'});
    });

    it('should get colour control command code B5', function(){
      expect(s.getColourControlCommandCode('B5')).toEqual({'set_font_color': 'magenta'});
    });

    it('should get colour control command code 26', function(){
      expect(s.getColourControlCommandCode('26')).toEqual({'set_font_color': 'cyan'});
    });

    it('should get colour control command code B6', function(){
      expect(s.getColourControlCommandCode('B6')).toEqual({'set_font_color': 'cyan'});
    });

    it('should get colour control command code 27', function(){
      expect(s.getColourControlCommandCode('27')).toEqual({'set_font_color': 'white'});
    });

    it('should get colour control command code B7', function(){
      expect(s.getColourControlCommandCode('B7')).toEqual({'set_font_color': 'white'});
    });


    it('should get colour control command code 30', function(){
      expect(s.getColourControlCommandCode('30')).toEqual({'set_background_color': 'black'});
    });

    it('should get colour control command code C0', function(){
      expect(s.getColourControlCommandCode('C0')).toEqual({'set_background_color': 'black'});
    });

    it('should get colour control command code 31', function(){
      expect(s.getColourControlCommandCode('31')).toEqual({'set_background_color': 'red'});
    });

    it('should get colour control command code C1', function(){
      expect(s.getColourControlCommandCode('C1')).toEqual({'set_background_color': 'red'});
    });

    it('should get colour control command code 32', function(){
      expect(s.getColourControlCommandCode('32')).toEqual({'set_background_color': 'green'});
    });

    it('should get colour control command code C2', function(){
      expect(s.getColourControlCommandCode('C2')).toEqual({'set_background_color': 'green'});
    });

    it('should get colour control command code 33', function(){
      expect(s.getColourControlCommandCode('33')).toEqual({'set_background_color': 'yellow'});
    });

    it('should get colour control command code C3', function(){
      expect(s.getColourControlCommandCode('C3')).toEqual({'set_background_color': 'yellow'});
    });

    it('should get colour control command code 34', function(){
      expect(s.getColourControlCommandCode('34')).toEqual({'set_background_color': 'blue'});
    });

    it('should get colour control command code C4', function(){
      expect(s.getColourControlCommandCode('C4')).toEqual({'set_background_color': 'blue'});
    });

    it('should get colour control command code 35', function(){
      expect(s.getColourControlCommandCode('35')).toEqual({'set_background_color': 'magenta'});
    });

    it('should get colour control command code C5', function(){
      expect(s.getColourControlCommandCode('C5')).toEqual({'set_background_color': 'magenta'});
    });

    it('should get colour control command code 36', function(){
      expect(s.getColourControlCommandCode('36')).toEqual({'set_background_color': 'cyan'});
    });

    it('should get colour control command code C6', function(){
      expect(s.getColourControlCommandCode('C6')).toEqual({'set_background_color': 'cyan'});
    });

    it('should get colour control command code 37', function(){
      expect(s.getColourControlCommandCode('37')).toEqual({'set_background_color': 'white'});
    });

    it('should get colour control command code C7', function(){
      expect(s.getColourControlCommandCode('C7')).toEqual({'set_background_color': 'white'});
    });

    it('should return undefined on unsupported colour control', function(){
      expect(s.getColourControlCommandCode('X1')).toBeUndefined();
    });

    it('should return undefined on unsupported colour code', function(){
      expect(s.getColourControlCommandCode('C9')).toBeUndefined();
    });
  });

  describe("parseScreen()", function(){
    it("should return empty object on empty string", function() {
      expect(s.parseScreen('')).toBeFalsy();
    });

    it("should parse screen number", function() {
      var parsed = {
        number: '778',
        actions: [],
      };
      expect(s.parseScreen('778')).toEqual(parsed);
    });

    it("should parse the screen and put the text", function() {
      var parsed = {
        number: '942',
        actions: [ 
          Object({ 
            add_text: Object({ 
              '@': 'TESTTEXT                        ', 
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
              }) 
          }), 
          Object({ move_cursor: Object({ x: 'H', y: '@' }) }) 
        ]
      };
      expect(s.parseScreen('942TESTTEXT')).toEqual(parsed);
    });

    it("should clear screen and put the text", function() {
      var parsed = {
        number: '039',
        actions: [
          'clear_screen',
           {
              add_text: 
              { 
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
              }
            },
            {
              move_cursor: 
              { 
                x: 'D', 
                y: '@' 
              }
            }
        ],
      };
      expect(s.parseScreen('039\x0cTEXT')).toEqual(parsed);
    });

    it("should parse Display Image File control", function() {
      var parsed = {
        number: '000',
        actions: [ 
          'clear_screen', 
          Object({ display_image: 'PIC000.jpg' }), 
          Object({ move_cursor: Object({ x: '@', y: '@' }) }) 
        ]
      };
      expect(s.parseScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c')).toEqual(parsed);
    });

    it("should parse Set Cursor Position control", function() {
      var parsed = {
        number: '000',
        actions: [ 
          'clear_screen', 
          Object({ display_image: 'PIC000.jpg' }), 
          Object({ move_cursor: Object({ x: 'O', y: 'F' }) }) 
        ]
      };
      expect(s.parseScreen('000\x0c\x1bPEPIC000.jpg\x1b\x5c\x0FFO')).toEqual(parsed);
    });

    it('should parse Screen Blinking and Colour control', function(){
      var parsed = {
        number: '060',
        actions: [ 
          'clear_screen', 
          Object({ display_image: 'PIC060.jpg' }), 
          Object({ set_font_color: 'white' }), 
          Object({ set_background_color: 'transparent' }), 
          Object({ insert_screen: '963' }), 
          Object({ set_font_color: 'yellow' }), 
          Object({ set_background_color: 'transparent' }), 
          Object({ add_text: Object({ 
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
            'O': '                                ' }) 
          }), 
          Object({ move_cursor: Object({ x: 'H', y: 'H' }) }) 
        ]
      };
      /*
      0c 1b 50 45 50 49 43 30 36 30 2e 6a 70 67 1b 5c     ..PEPIC060.jpg.\
      1b 5b 32 37 3b 38 30 6d 0f 47 48 0e 39 36 33 20     .[27;80m.GH.963 
      55 53 44 1b 5b 32 37 3b 38 30 6d 0f 48 48           USD.[27;80m.HH
       */
      expect(s.parseScreen('060\x0c\x1bPEPIC060.jpg\x1b\x5c\x1b[27;80m\x0fGH\x0e963USD\x1b[23;80m\x0fHH')).toEqual(parsed);
    });


    it('should parse Changing Display During the Idle Loop control', function(){
      var parsed = {
        number: '970',
        actions: [ 
          Object({ insert_screen: '010' }), 
          Object({ delay: 3000 }), 
          Object({ insert_screen: '011' }), 
          Object({ delay: 3000 }), 
          Object({ insert_screen: '012' }), 
          Object({ delay: 3000 }), 
          Object({ insert_screen: '013' }), 
          Object({ delay: 3000 })
        ]
      };
      /*
                     39 37 30 0e 30 31 30 1b 5b 30 33          970.010.[03
      30 7a 0e 30 31 31 1b 5b 30 33 30 7a 0e 30 31 32     0z.011.[030z.012
      1b 5b 30 33 30 7a 0e 30 31 33 1b 5b 30 33 30 7a     .[030z.013.[030z
       */
      expect(s.parseScreen('970\x0e010\x1b[030z\x0e011\x1b[030z\x0e012\x1b[030z\x0e013\x1b[030z')).toEqual(parsed);
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

    it("should add single screen passed as a string", function() {
      expect(s.add('000\x0c\x1bPEPIC000.jpg\x1b\x5c')).toBeTruthy();
    });

    it("should add multiple screens", function() {
      expect(s.add(['000\x0c\x1bPEPIC000.jpg\x1b\x5c', '001\x0c\x1bPEPIC001.jpg\x1b\x5c'])).toBeTruthy();
    });

    it("should not add multiple erroneus screens", function() {
      expect(s.add(['', ''])).toBeFalsy();
    });
  });

  describe('parseDynamicScreenData()', function(){
    it('should parse dynamic screen', function(){
      var parsed = {
        number: 'DYNAMIC',
        actions: [ 
          'clear_screen', 
          'clear_screen', 
          Object({ display_image: 'PIC235.jpg' }), 
          Object({ add_text: 
            Object({ 
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
            }) 
          }), 
          Object({ move_cursor: 
            Object({ x: '?', y: 'F' }) 
          }) 
        ]
      };
      expect(s.parseDynamicScreenData('\x0c\x0c\x1BPEPIC235.jpg\x1b\x5c\x0FFK              COUPON')).toEqual(parsed);
    })
  });

  describe('parseScreenDisplayUpdate()', function(){
    it('should parse screen display update data', function(){
      expect(s.get('123')).toBeUndefined();

      var screen = { 
        number: '123', 
        actions: [ 
          'clear_screen', 
          Object({ add_text: 
            Object({ 
              '@': 'SCREEN DATA                     ', 
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
            }) 
          }), 
          Object({ move_cursor: 
            Object({ x: 'K', y: '@' }) 
          }) 
        ] 
      };

      var parsed;
      expect(s.parseScreenDisplayUpdate('u09621000\x1d0000123\x0cSCREEN DATA')).toBeTruthy();
      expect(s.get('123')).toEqual(screen);
    });
  });
});
