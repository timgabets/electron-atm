describe("Screens", function() {
  var ScreensService = require('../../src/services/screens.js');
  var s;

  beforeEach(function() {
    s = new ScreensService();
  });

  describe("parseScreen()", function(){
    it("should parse screen number", function() {
      var parsed = {
        number: '778',
      };
      expect(s.parseScreen('778iddqd')).toEqual(parsed);
    });
  });  
});
