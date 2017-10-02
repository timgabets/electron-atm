describe("CardValidationService", function() {
  var CardValidationService = require('../../src/services/cardvalidation.js');
  var s;

  beforeEach(function() {
    s = new CardValidationService();
  });

  describe('validateMonth()', function(){
    it('should not validate non-integer month', function(){
      expect(s.validateMonth('January')).toBeFalsy();
    });

    it('should not validate month 00', function(){
      expect(s.validateMonth('00')).toBeFalsy();
    });

    it('should validate month 05', function(){
      expect(s.validateMonth('05')).toBeTruthy();
    });
  });

  describe('validateYYMM()', function(){
    it('should not validate non-integer date', function(){
      expect(s.validateYYMM('yyMM')).toBeFalsy();
    });

    it('should not validate month 00', function(){
      expect(s.validateYYMM('0000')).toBeFalsy();
    });

    it('should validate 1912', function(){
      expect(s.validateYYMM('1912')).toBeTruthy();
    });
  }); 

  describe('decorateCardNumber()', function(){
    it('should not decorate empty cardnumber', function(){
      expect(s.decorateCardNumber('')).toEqual('');
    });

    it('should decorate cardnumber', function(){
      expect(s.decorateCardNumber('1111222233334444')).toEqual('1111 2222 3333 4444');
    });
  }); 
});
