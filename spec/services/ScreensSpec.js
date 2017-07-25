describe("Screens", function() {
  var ScreensService = require('../../src/services/screens.js');
  var log, settings, s;

  beforeEach(function() {
    log = {
      log: function() {
      }
    };
    
    settings = {
      get: function(value) {
        return {};
      },
      set: function(value){
      }
    };

    s = new ScreensService(settings, log);
  });

  describe("parseScreen()", function(){
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
  });  
});
