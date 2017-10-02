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
});
