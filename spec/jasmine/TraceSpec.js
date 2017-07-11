describe("Trace", function() {
  var Trace = require('../../src/trace.js');
  var t;

  beforeEach(function() {
    t = new Trace();
  });

  describe("dump()", function(){
      it("should dump empty data", function() {
        expect(t.dump('')).toEqual('');
      });
  });
});
