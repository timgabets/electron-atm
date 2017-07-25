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
    it("should convert decimal 9 to hex 09", function() {
      expect(f.d2h('9')).toEqual('09');
    });

    it("should convert decimal 28 to hex 1С", function() {
      expect(f.d2h('28')).toEqual('1C');
    });

    it("should convert decimal 065 to hex FF", function() {
      expect(f.d2h('065')).toEqual('41');
    });

    it("should convert decimal 255 to hex FF", function() {
      expect(f.d2h('255')).toEqual('FF');
    });
  });

  describe("leftpad()", function(){
    it("should pad string '1' to string '001'", function() {
      expect(f.leftpad('1')).toEqual('001');
    });

    it("should pad string 'XZ' to string '0XZ'", function() {
      expect(f.leftpad('XZ')).toEqual('0XZ');
    });

    it("string '123' should return unchanged", function() {
      expect(f.leftpad('123')).toEqual('123');
    });
  });  

  describe("decimal2hex()", function(){
    it("should convert decimal 1 to hex 01", function() {
      expect(f.decimal2hex('1')).toEqual('01');
    });

    it("should convert decimal 254 to hex FE", function() {
      expect(f.decimal2hex('254')).toEqual('FE');
    });

    it("should convert decimal 1254 to hex FE", function() {
      expect(f.decimal2hex('1254')).toEqual('01FE');
    });

    it("should convert decimal 65136037255255 to hex 418825FFFF", function() {
      expect(f.decimal2hex('65136037255255')).toEqual('418825FFFF');
    });
  });  

  describe("parseFIT()", function(){
    it("should return empty object on empty string", function() {
      expect(f.parseFIT('')).toBeFalsy();
    });

    it("should parse FIT", function() {
      var parsed = {
        PIDDX: '04',
        PFIID: '418825FFFF',
        PSTDX: '01'
      };
      expect(f.parseFIT('004000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toEqual(parsed);
    });
  });
  /*
    */
});
