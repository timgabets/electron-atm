describe("CryptoService", function() {
  var CryptoService = require('../../src/services/crypto.js');
  var log, settings, s;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };
    
    settings = {
      get: function() {
        return {};
      },
      set: function(value){
      }
    };

    s = new CryptoService(settings, log);
  });


  describe('getEncryptedPIN()', function(){
    beforeEach(function() {
      s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should get encrypted PIN', function(){
      expect(s.getEncryptedPIN('1234', '4000001234562000')).toEqual('<3;:1>04=88654<4');
    });

    it('should return null if no terminal key', function(){
      s.setTerminalKey(undefined);
      expect(s.getEncryptedPIN('1234', '4000001234562000')).toBeNull();
    });    
  });

  describe('', function(){
    it('should format key', function(){
      expect(s.format('DEADBEEFDEADBEEFDEADBEEFDEADBEEF')).toEqual('DEAD BEEF DEAD BEEF DEAD BEEF DEAD BEEF');
    })
  })
});
