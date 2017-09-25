describe("Trace", function() {
  var Trace = require('../../src/controllers/trace.js');
  var t;

  beforeEach(function() {
    t = new Trace();
  });

  describe("dump()", function(){
      it("should dump empty data", function() {
        expect(t.dump('')).toEqual('');
      });

      it("should dump binary data", function() {
        expect(t.dump('40\x1c000\x1c\x1c133\x1c\x1c07759064\x1c200')).toEqual('    34 30 1c 30 30 30 1c 1c 31 33 33 1c 1c 30 37 37     40.000..133..077\n    35 39 30 36 34 1c 32 30 30                          59064.200');
      });
  });

  describe("object()", function(){
    it("should trace the object properties", function() {
      var obj = { 
        message_class: 'Terminal Command',
        LUNO: '000',
        message_sequence_number: '000',
        command_code: 'Go in-service'
      };
      expect(t.object(obj)).toEqual('\n    [message_class          ]: [Terminal Command]\n    [LUNO                   ]: [000]\n    [message_sequence_number]: [000]\n    [command_code           ]: [Go in-service]\n');
    });

    it("should trace array object", function() {
      var obj = {
        states: ['003', '744', '987'],
      };
      expect(t.object(obj)).toEqual('\n    [states]: ["003","744","987"]\n');
    });


    it("should trace array nested object properties", function() {
      var obj = {
        data: {
          alpha: '744321',
          beta:  '98765',
        },
      };
      expect(t.object(obj)).toEqual('\n    [data]: {"alpha":"744321","beta":"98765"}\n');
    });

  });  
});
