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

  describe("parseScreen()", function(){
    it("should return empty object on empty string", function() {
      expect(s.parseScreen('')).toBeFalsy();
    });


    it("should parse screen number", function() {
      var parsed = {
        number: '778',
      };
      expect(s.parseScreen('778iddqd')).toEqual(parsed);
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
    /*
    12:01:47.874<< 84 bytes received:
      00 52 33 30 1c 30 30 30 1c 30 30 30 1c 32 31 30         .R30.000.000.210
      31 30 30 30 31 30 30 30 30 1c 30 33 37 1c 0c 0c         100010000.037...
      1b 50 45 50 49 43 32 33 35 2e 6a 70 67 1b 5c 1b         .PEPIC235.jpg.\.
      5b 32 37 3b 38 30 6d 1b 28 76 1b 29 76 0f 46 4b         [27;80m.(v.)v.FK
      20 20 20 20 20 20 20 20 20 20 20 20 20 20 43 4f                       CO
      55 50 4f 4e                                             UPON
   */
    it('should parse', function(){
      var parsed = {
        number: 'DYNAMIC',
        display_image_files_control: true,
        image_file: 'PIC235.jpg',
      };
      expect(s.parseDynamicScreenData('\x1BPEPIC235.jpg\x1B\\x1B[27;80m\x1B(v\x1B)v\x0FFK              COUPON')).toEqual(parsed);
    })
  });

});
