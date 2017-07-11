describe("Network", function() {
  var Network = require('../../src/network.js');
  var n;

  beforeEach(function() {
    n = new Network();
  });

  describe("getOutgoingMessageLength()", function(){
      it("should be able to get proper empty message length", function() {
        expect(n.getOutgoingMessageLength('')).toEqual('\x00\x00');
      });
    
      it("should return the length for message.len === 10", function() {
        expect(n.getOutgoingMessageLength('0123456789')).toEqual('\x00\x0a');
      });
    
      it("should return the length for message.len === 16", function() {
        expect(n.getOutgoingMessageLength('0123456789abcdef')).toEqual('\x00\x10');
      });
  });
});
