describe("DES3", function() {
  var DES3 = require('../../src/controllers/des3.js');
  des3 = new DES3();

  describe("encrypt()", function(){
    it("should encrypt zeroed data with zeroed key", function() {
      expect(des3.encrypt('00000000000000000000000000000000', '00000000000000000000000000000000')).toEqual('8CA64DE9C1B123A78CA64DE9C1B123A7');
    });

    it("should encrypt random 16-byte data with random key", function() {
      expect(des3.encrypt('323004E8FEEBBCF681F3A0B76C611736', 'F91D0CF0D56B5B98')).toEqual('62C28519F7005F51');
    });

    it("should encrypt random 32-byte data with random key", function() {
      expect(des3.encrypt('323004E8FEEBBCF681F3A0B76C611736', 'A30CA3BC0CC0BE26CE844F2742934B14')).toEqual('C12FC53F91D0CF0D56B5B9813A32B854');
    });
  });

  describe("decrypt()", function(){
    it("should decrypt zeroed data with zeroed key", function() {
      expect(des3.decrypt('00000000000000000000000000000000', '00000000000000000000000000000000')).toEqual('8CA64DE9C1B123A78CA64DE9C1B123A7');
    });

    it("should decrypt random 16-byte data with random key", function() {
      expect(des3.decrypt('323004E8FEEBBCF681F3A0B76C611736', 'F91D0CF0D56B5B98')).toEqual('A769CF9FA14EAAC5');
    });

    it("should decrypt random 32-byte data with random key", function() {
      expect(des3.decrypt('323004E8FEEBBCF681F3A0B76C611736', 'A30CA3BC0CC0BE26CE844F2742934B14')).toEqual('CFF6C3758A26AC49D57C3ADE0AF30856');
    });
  });
});