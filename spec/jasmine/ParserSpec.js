describe("Parser", function() {
  var Parser = require('../../src/parser.js');
  var p;

  beforeEach(function() {
    p = new Parser();
  });

  describe("parse()", function(){
      it("should be able to get proper empty message length", function() {
        expect(p.parse('')).toEqual(true);
      });
  });
});
