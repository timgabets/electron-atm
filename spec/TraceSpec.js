describe("Trace", function() {
  var Trace = require('../src/trace.js');
  var t;

  beforeEach(function() {
    t = new Trace();
  });

  describe("dump()", function(){
      it("should dump empty data", function() {
        expect(t.dump('')).toEqual('');
      });

      it("should dump binary data", function() {
        expect(t.dump('40\x1c000\x1c\x1c133\x1c\x1c07759064\x1c200')).toEqual('\t34 30 1c 30 30 30 1c 1c 31 33 33 1c 1c 30 37 37         40.000..133..077\n\t35 39 30 36 34 1c 32 30 30                              59064.200');
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
        expect(t.object(obj)).toEqual('\n\t[message_class          ]: [Terminal Command]\n\t[LUNO                   ]: [000]\n\t[message_sequence_number]: [000]\n\t[command_code           ]: [Go in-service]\n');
      });
  });  
});
