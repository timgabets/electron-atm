describe("Parser", function() {
  var Parser = require('../../src/parser.js');
  var p;

  beforeEach(function() {
    p = new Parser();
  });

  describe("getIncomingMessageLength()", function(){
      it("should be able to get length of the empty message", function() {
        expect(p.getIncomingMessageLength('')).toEqual(0);
      });

      it("should be able to parse the message length 1", function() {
        expect(p.getIncomingMessageLength('\x00\x01x')).toEqual(1);
      });

      it("should be able to parse the message length 10", function() {
        expect(p.getIncomingMessageLength('\x00\x0ax')).toEqual(10);
      });

      it("should be able to parse the message length 255", function() {
        expect(p.getIncomingMessageLength('\x00\xffx')).toEqual(255);
      });

      it("should be able to parse the message length 256", function() {
        expect(p.getIncomingMessageLength('\x01\x00x')).toEqual(256);
      });

      it("should be able to parse the message length 43981", function() {
        expect(p.getIncomingMessageLength('\xab\xcdx')).toEqual(43981);
      });

      it("should be able to parse the message length 65535", function() {
        expect(p.getIncomingMessageLength('\xff\xffx')).toEqual(65535);
      });
  });

  describe("parse())", function(){
      it("should be able to parse 'Go out of service' message", function() {
        var parsed = { 
          message_class: 'Terminal Command', 
          LUNO: '000', 
          message_sequence_number: '000', 
          command_code: 'Go out-of-service' 
        };
        expect(p.parse('10\x1c000\x1c000\x1c2', 12)).toEqual(parsed);
      });

      it("should be able to parse 'Transaction reply' message", function() {
        var parsed = { 
          message_class: 'Transaction Reply Command', 
          LUNO: '000', 
          message_sequence_number: '', 
          next_state: '133', 
          transaction_serial_number: '0775', 
          function_identifier: '9', 
          screen_number: '064', 
          message_coordination_number: '2', 
          card_return_flag: '0', 
          printer_flag: '0' 
        };
        expect(p.parse('40\x1c000\x1c\x1c133\x1c\x1c07759064\x1c200', 25)).toEqual(parsed);
      });
  });  

  describe("parseHostMessage()", function(){
      it("should be able to parse 'Go out of service message'", function() {
        var parsed = { 
          message_class: 'Terminal Command', 
          LUNO: '000', 
          message_sequence_number: '000', 
          command_code: 'Go out-of-service' 
        };
        expect(p.parseHostMessage('\x00\x0c10\x1c000\x1c000\x1c2')).toEqual(parsed);
      });
  });
});
