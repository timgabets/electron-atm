describe("OperationCodeBufferService", function() {
  var OperationCodeBufferService = require('../../src/services/opcode.js');

  beforeEach(function() {
    s = new OperationCodeBufferService();
  });

  describe('getTerminalKey() and getMasterKey()', function(){
    beforeEach(function() {
      s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should get terminal key', function(){
      expect(s.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
    });
  });
});
