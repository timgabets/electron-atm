describe("OperationCodeBufferService", function() {
  var OperationCodeBufferService = require('../../src/services/opcode.js');
  var log;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };

    s = new OperationCodeBufferService(log);
  });

  describe('setBufferValueAt()', function(){
    it('should set buffer value at position 0', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(0, 'A')).toBeTruthy();
      expect(s.buffer).toEqual('A       ');
    });

    it('should set buffer value at position 1', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(1, 'B')).toBeTruthy();
      expect(s.buffer).toEqual(' B      ');
    });

    it('should set buffer value at position 2', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(2, 'D')).toBeTruthy();
      expect(s.buffer).toEqual('  D     ');
    });

    it('should set buffer value at position 3', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(3, 'E')).toBeTruthy();
      expect(s.buffer).toEqual('   E    ');
    });

    it('should set buffer value at position 4', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(4, 'F')).toBeTruthy();
      expect(s.buffer).toEqual('    F   ');
    });

    it('should set buffer value at position 5', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(5, 'G')).toBeTruthy();
      expect(s.buffer).toEqual('     G  ');
    });

    it('should set buffer value at position 6', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(6, 'H')).toBeTruthy();
      expect(s.buffer).toEqual('      H ');
    });

    it('should set buffer value at position 7', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(7, 'I')).toBeTruthy();
      expect(s.buffer).toEqual('       I');
    });

    it('should not change buffer value in case of index overflow', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(-1, 'H')).toBeFalsy();
      expect(s.buffer).toEqual('        ');
    });

    it('should not change buffer value in case of index multiple-char-length string', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(1, 'AB')).toBeFalsy();
      expect(s.buffer).toEqual('        ');
    });

    it('should not change buffer value to the values, other than [A-I]', function(){
      expect(s.buffer).toEqual('        ');
      expect(s.setBufferValueAt(3, 'J')).toBeFalsy();
      expect(s.buffer).toEqual('        ');
    });
  });
});
