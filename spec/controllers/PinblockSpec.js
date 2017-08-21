describe("Pinblock", function() {
  var Pinblock = require('../../src/controllers/pinblock.js');
  pinblock = new Pinblock();

  describe("get()", function(){
    it("should get PIN 1234", function() {
      expect(pinblock.get('1234', '4000001234562000')).toEqual('041234FEDCBA9DFF');
    });
  });
});