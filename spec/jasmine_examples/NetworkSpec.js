describe("Network", function() {
  var Network = require('../../src/network.js');
  var n;

  beforeEach(function() {
    n = new Network();
  });

  it("should be able to get proper empty message length", function() {
    expect(n.getOutgoingMessageLength('')).toEqual('\x00\x00');
  });
});
