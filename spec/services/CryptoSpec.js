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

  describe('setCommsKey()', function(){
    beforeEach(function() {
      s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should change terminal PIN key', function(){
      var data = {
        message_class: 'Data Command',
        LUNO: 000,
        message_sequence_number: '000',
        message_subclass: 'Extended Encryption Key Information',
        modifier: 'Decipher new comms key with current master key',
        new_key_length: '030',
        new_key_data: '040198145193087203201076202216192211251240251237',
      };
      /*
        new_key_data: '040198145193087203201076202216192211251240251237' is decimal representation of 28C691C157CBC94CCAD8C0D3FBF0FBED
        28C691C157CBC94CCAD8C0D3FBF0FBED is 7B278B03B439DDCACF8B3333AC591BCA encrypted under B6D55EABAD23BC4FD558F8D619A21C34.
       */
      expect(s.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
      expect(s.setCommsKey(data.new_key_data, data.new_key_length)).toBeTruthy()
      expect(s.getTerminalKey()).toEqual(['7B278B03B439DDCACF8B3333AC591BCA', '41DD5C']);
    })

    it('should raise if master key is empty', function(){
      var data = {
        message_class: 'Data Command',
        LUNO: 000,
        message_sequence_number: '000',
        message_subclass: 'Extended Encryption Key Information',
        modifier: 'Decipher new comms key with current master key',
        new_key_length: '030',
        new_key_data: '040198145193087203201076202216192211251240251237',
      };
      /*
        new_key_data: '040198145193087203201076202216192211251240251237' is decimal representation of 28C691C157CBC94CCAD8C0D3FBF0FBED
        28C691C157CBC94CCAD8C0D3FBF0FBED is 7B278B03B439DDCACF8B3333AC591BCA encrypted under B6D55EABAD23BC4FD558F8D619A21C34.
       */
      s.setMasterKey(null) ;
      expect(s.setCommsKey(data.new_key_data, data.new_key_length)).toBeFalsy()
    })
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
