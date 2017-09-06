describe("Pinblock", function() {
  var Pinblock = require('../../src/controllers/pinblock.js');
  pinblock = new Pinblock();

  describe("get()", function(){
    it("should get pinblock for PIN length 4", function() {
      expect(pinblock.get('1234', '4000001234562000')).toEqual('041234FEDCBA9DFF');
    });

    it("should get pinblock for PIN length 5", function() {
      expect(pinblock.get('92389', '4000001234562')).toEqual('0592789FFFEDCBA9');
    });
  });

  describe("encode_to_atm_format()", function(){
    it("should encode pinblock to ATM format", function() {
      expect(pinblock.encode_to_atm_format('0123456789ABCDEF')).toEqual('0123456789:;=<>?');
    });

    it("should format to empty string when the empty string passed as pinblock", function() {
      expect(pinblock.encode_to_atm_format('')).toEqual('');
    });
  });

  describe("decode_from_atm_format()", function(){
    it("should decode pinblock from ATM format", function() {
      expect(pinblock.decode_from_atm_format('0123456789:;=<>?')).toEqual('0123456789ABCDEF');
    });
  });
});