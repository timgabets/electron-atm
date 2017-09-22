describe("DisplayService", function() {
  var DisplayService = require('../../src/services/display.js');
  var log, screens, display;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };
    
    screens = {
      get: function() {
        return {};
      }
    };

    display = new DisplayService(screens, log);
  });

  describe('getScreenNumber()', function(){
    it('should get screen number', function(){
      display.current_screen = {
        number: '023',
      };
      expect(display.getScreenNumber()).toEqual('023');
    })
  })
});
