describe("Timestamp", function() {
  var Timestamp = require('../../src/services/timestamp.js');
  t = new Timestamp();

  describe("get()", function(){
    it("should get timestamp in a proper format", function() {
      var timestamp = t.get();
      // 20:05:55.966
      expect(timestamp.length).toEqual(12);
      // 20
      expect(timestamp[2]).toEqual(':');
      // 05
      expect(timestamp[5]).toEqual(':');
      // 55
      expect(timestamp[8]).toEqual('.');
    });
  });
});