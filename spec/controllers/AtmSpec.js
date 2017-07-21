describe("ATM", function() {
  var ATM = require('../../src/controllers/atm.js');
  var atm;

  beforeEach(function() {
    atm = new ATM();
  });

  describe("processHostMessage()", function(){
    it("should return false on empty message", function() {
      var host_message = {};
      expect(atm.processHostMessage(host_message)).toEqual(false);
    });

  });
});
