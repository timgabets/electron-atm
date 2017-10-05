describe("FITs", function() {
  var FITsService = require('../../src/services/fits.js');
  var log, settings, f;

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
        PIDDX: '029',
        PFIID: '418825FFFF',
        PSTDX: '01',
        PAGDX: '00',
        PMXPN: '84'
      };
      expect(f.parseFIT('029000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toEqual(parsed);
    });
  });

  describe("matchCardnumberWithMask()", function(){
    it("should match cardnumber with FFFFFFFFFF mask", function() {
      expect(f.matchCardnumberWithMask('4188250000000001', 'FFFFFFFFFF')).toBeTruthy();
    });

    it("should match cardnumber with 418825FFFF mask", function() {
      expect(f.matchCardnumberWithMask('4188250000000001', '418825FFFF')).toBeTruthy();
    });

    it("should match cardnumber with FFFFF5FFFF mask", function() {
      expect(f.matchCardnumberWithMask('4188250000000001', 'FFFFF5FFFF')).toBeTruthy();
    });

    it("should not match cardnumber with FFFFF5FFFF mask", function() {
      expect(f.matchCardnumberWithMask('4188290000000001', 'FFFFF5FFFF')).toBeFalsy();
    });
  });


  describe("getInstitutionByCardnumber()", function(){
    it("should return undefined if no match", function() {
      // PIDDX: '028'
      // PFIID: '409225FFFF'
      // PSTDX: '01'
      expect(f.addFIT('028000064146037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      expect(f.getInstitutionByCardnumber('4188250000000001')).toBeUndefined();
    });

    it("should get proper institution from 2 different FIT records", function() {
      // PIDDX: '028'
      // PFIID: '409225FFFF'
      // PSTDX: '03'
      expect(f.addFIT('028000064146037255255003000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      
      // PIDDX: '029'
      // PFIID: '418825FFFF'
      // PSTDX: '07'
      expect(f.addFIT('029000065136037255255007000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      expect(f.getInstitutionByCardnumber('4188250000000001')).toEqual('07');
    });
    
    it("should match only the first found FIT", function() {      
      // PIDDX: '005'
      // PFIID: '409225FFFF'
      // PSTDX: '01'
      expect(f.addFIT('005000064146037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      
      // PIDDX: '019'
      // PFIID: '418825FFFF'
      // PSTDX: '02'
      expect(f.addFIT('019000065136037255255002000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '020'
      // PFIID: '418825FFFF'
      // PSTDX: '03'
      expect(f.addFIT('020000065136037255255003000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '021'
      // PFIID: '418825FFFF'
      // PSTDX: '04'
      expect(f.addFIT('021000065136037255255004000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '022'
      // PFIID: '418825FFFF'
      // PSTDX: '05'
      expect(f.addFIT('022000065136037255255005000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      
      expect(f.getInstitutionByCardnumber('4188250000000001')).toEqual('02');
    });

    it("should order FITs by PIDDX regardless FIT addition order", function() {      

      // PIDDX: '019'
      // PFIID: '418825FFFF'
      // PSTDX: '02'
      expect(f.addFIT('019000065136037255255002000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '018'
      // PFIID: '418825FFFF'
      // PSTDX: '03'
      expect(f.addFIT('018000065136037255255003000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '018'
      // PFIID: '418825FFFF'
      // PSTDX: '04'
      expect(f.addFIT('017000065136037255255004000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '018'
      // PFIID: '418825FFFF'
      // PSTDX: '05'
      expect(f.addFIT('016000065136037255255005000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '018'
      // PFIID: '418825FFFF'
      // PSTDX: '06'
      expect(f.addFIT('013000065136037255255006000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '018'
      // PFIID: '418825FFFF'
      // PSTDX: '07'
      expect(f.addFIT('003000065136037255255007000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      
      expect(f.getInstitutionByCardnumber('4188250000000001')).toEqual('07');
    });
  });
  
  describe("add()", function(){
    it("should add FITs", function() {
      var fits = ['000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000', '001000065007054255255001000132000015000144000000000000000000000000000000000000000000000000000000000', '002000065007055255255001000132000015000144000000000000000000000000000000000000000000000000000000000', '003000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000', '004000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000', '005000065136086255255001000132000015000144000000000000000000000000000000000000000000000000000000000'];
      expect(f.add(fits)).toBeTruthy();
    });

    it("should add single FIT passed as string", function() {
      expect(f.add('000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
    });

    it("should add not add multiple empty FITs passed as array", function() {
      expect(f.add(['', ''])).toBeFalsy();
    });
  });

  describe("getMaxPINLength()", function(){
    it("should return max PIN length 4", function() {
      // PIDDX: '020'
      // PFIID: '418825FFFF'
      // PSTDX: '03'
      expect(f.addFIT('020000065136037255255003000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      expect(f.getMaxPINLength('4188250000000001')).toEqual('4');
    });

    it("should return max PIN length 6", function() {
      // PIDDX: '020'
      // PFIID: '418825FFFF'
      // PSTDX: '03'
      expect(f.addFIT('020000065136037255255003000134000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();
      expect(f.getMaxPINLength('4188250000000001')).toEqual('6');
    });
  });

  describe('get()', function(){
    it('should get FIT records list ordered by PIDDX', function(){
      // PIDDX: '019'
      // PFIID: '418825FFFF'
      // PSTDX: '02'
      expect(f.addFIT('019000065136037255255002000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      // PIDDX: '005'
      // PFIID: '409225FFFF'
      // PSTDX: '01'
      expect(f.addFIT('005000064146037255255001000132000015000144000000000000000000000000000000000000000000000000000000000')).toBeTruthy();

      expect(f.get()).toEqual(
        [ 
          { PIDDX: '005', PFIID: '409225FFFF', PSTDX: '01', PAGDX: '00', PMXPN: '84' }, 
          { PIDDX: '019', PFIID: '418825FFFF', PSTDX: '02', PAGDX: '00', PMXPN: '84' } ] 
      );
    });
  })
});
