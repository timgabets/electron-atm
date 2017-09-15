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

  describe('getTerminalKey() and getMasterKey()', function(){
    beforeEach(function() {
      s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should get terminal key', function(){
      expect(s.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
    });

    it('should get master key', function(){
      expect(s.getMasterKey()).toEqual(['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
    });
  });

  describe('setTerminalKey() and setMasterKey()', function(){
    beforeEach(function() {
      s.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      s.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
      spyOn(settings, 'set');
    });

    it('should set terminal key', function(){
      expect(s.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
      s.setTerminalKey('B667E96A6D5C961CB667E96A6D5C961C');
      expect(s.getTerminalKey()).toEqual(['B667E96A6D5C961CB667E96A6D5C961C', '900A01']);
      expect(settings.set).toHaveBeenCalled();
    });

    it('should set master key', function(){
      expect(s.getMasterKey()).toEqual(['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
      s.setMasterKey('D2C4E412AE89A92AD2C4E412AE89A92A');
      expect(s.getMasterKey()).toEqual(['D2C4E412AE89A92AD2C4E412AE89A92A', '58E506']);
      expect(settings.set).toHaveBeenCalled();
    });
  });

  describe('getKeyCheckValue()', function(){
    it('should return key check value', function(){
      expect(s.getKeyCheckValue('DEADBEEFDEADBEEFDEADBEEFDEADBEEF')).toEqual('2AE358');
    })
  });

  describe('dec2hex()', function(){
    it('should convert decimal string to hex string', function(){
      expect(s.dec2hex('040198145193087203201076202216192211251240251237')).toEqual('28C691C157CBC94CCAD8C0D3FBF0FBED');
    });

    it('should convert decimal string to hex string', function(){
      expect(s.dec2hex('000001002003004005006007008009010011012013014015')).toEqual('000102030405060708090A0B0C0D0E0F');
    });
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
