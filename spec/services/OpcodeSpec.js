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

  describe("setOpCodeBuffer()", function(){
    it("should clear opcode buffer completely", function() {
      /**
       * Specifies bytes of Operation Code buffer to be cleared to graphic ‘space’. Each bit relates to a byte
       * in the Operation Code buffer. If a bit is zero, the corresponding entry is cleared. If a bit is one, the
       * corresponding entry is unchanged. 
       */
      s.buffer = 'HHHHHHHH'

      var stateD ={ 
        clear_mask: '000',  // 0000 0000
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(s.buffer).toEqual('HHHHHHHH');
      expect(s.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(s.buffer).toEqual('        ');
    });

    it("should left opcode buffer untouched", function() {
      s.buffer = 'HHHHHHHH'
      var stateD = { 
        clear_mask: '255',  // 1111 1111
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(s.buffer).toEqual('HHHHHHHH');
      expect(s.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(s.buffer).toEqual('HHHHHHHH');
    });

    it("should clear only the left half of opcode buffer", function() {
      s.buffer = 'BBBBBBBB'
      var stateD = { 
        clear_mask: '240', // 1111 0000
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(s.buffer).toEqual('BBBBBBBB');
      expect(s.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(s.buffer).toEqual('    BBBB');
    });


    it("should set opcode values with proper B and C characters", function() {
      var stateD = { 
        clear_mask: '000', 
        A_preset_mask: '000', // 0000 0000
        B_preset_mask: '042', // 0010 1010
        C_preset_mask: '006', // 0000 0110 
        D_preset_mask: '000', // 0000 0000
        extension_state: '000' 
      };

      expect(s.buffer).toEqual('        ');
      expect(s.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(s.buffer).toEqual(' CCB B  ');
    });

    it("should set opcode values characters from extension state", function() {
      var stateD = { 
        clear_mask: '000', 
        A_preset_mask: '000', // 0000 0000
        B_preset_mask: '000', // 0000 0000
        C_preset_mask: '000', // 0000 0000
        D_preset_mask: '000', // 0000 0000
        extension_state: '000' 
      };

      var stateZ = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', 
          '128', // F 1000 0000
          '064', // G 0100 0000
          '052', // H 0011 0100
          '009', // I 0000 1001
          'CDE', 
          'FGH', 
          'IJK', 
          'LMN' ] 
      };

      expect(s.buffer).toEqual('        ');
      expect(s.setOpCodeBuffer(stateD, stateZ)).toBeTruthy();
      expect(s.buffer).toEqual('I HIHHGF');
    });
  });

});
