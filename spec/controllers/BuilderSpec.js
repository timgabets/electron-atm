describe("Builder", function() {
  var Builder = require('../../src/controllers/builder.js');
  var b;
  var luno = '777';

  beforeEach(function() {
    b = new Builder(luno);
  });

  describe("build()", function(){
    it("should return null on empty message", function() {
      expect(b.build(undefined)).toBeNull();
    });

    it("should build solicited ready status message", function() {
      var object = {
        message_class: 'Solicited',
        message_subclass: 'Status',
        status_descriptor: 'Ready',
      };
      expect(b.build(object)).toEqual('22\x1C777\x1C\x1C9');
    });

    it("should build solicited command reject status message", function() {
      var object = {
        message_class: 'Solicited',
        message_subclass: 'Status',
        status_descriptor: 'Command Reject',
      };
      expect(b.build(object)).toEqual('22\x1C777\x1C\x1CA');
    });

    it("should build solicited specific command reject status message", function() {
      var object = {
        message_class: 'Solicited',
        message_subclass: 'Status',
        status_descriptor: 'Specific Command Reject',
      };
      expect(b.build(object)).toEqual('22\x1C777\x1C\x1CC');
    });

    it("should build Unsolicited Transaction Request message with all data provided", function() {
      var object = {
        message_class: 'Unsolicited',
        message_subclass: 'Transaction Request',
        top_of_receipt: '1',
        message_coordination_number: '?',
        track2: ';8990011234567890=20062011987612300720?',
        opcode_buffer: 'BA BA BA',
        amount_buffer: '000000001337',
        PIN_buffer: ';>:>:=>:>:>:>:>:',
        buffer_B: '19671994',
        buffer_C: '1337',
        track1: '%B1234567890123445^PADILLA/L.                ^99011X100000*000000000XXX000000?',
      };
      expect(b.build(object)).toEqual('11\x1C777\x1C\x1C1?\x1C;8990011234567890=20062011987612300720?\x1C\x1CBA BA BA\x1C000000001337\x1C;>:>:=>:>:>:>:>:\x1C19671994\x1C1337\x1C%B1234567890123445^PADILLA/L.                ^99011X100000*000000000XXX000000?\x1C');
    });

  });
});
