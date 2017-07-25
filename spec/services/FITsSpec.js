describe("FITs", function() {
  var FITsService = require('../../src/services/fits.js');
  var log, settings, f;

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

    spyOn(settings, 'set');

    f = new FITsService(settings, log);
  });

  describe("d2h()", function(){
    it("should convert decimal 255 to hex FF", function() {
      expect(f.d2h('255')).toEqual('FF');
    });

    it("should convert decimal 255 to hex FF", function() {
      expect(f.d2h('065')).toEqual('41');
    });
  });

  /*
  describe("parseFIT()", function(){
    it("should return empty object on empty string", function() {
      expect(f.parseFIT('')).toBeFalsy();
    });

    it("should parse FIT", function() {
      var parsed = {
        PIDDX: '004',
      };
      expect(f.parseFIT('004000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toEqual(parsed);
    });
  });
    */
});
