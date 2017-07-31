describe("ATM", function() {
  var ATM = require('../../src/controllers/atm.js');
  var status_ready = { 
    message_class: 'Solicited', 
    message_subclass: 'Status', 
    status_descriptor: 'Ready' 
  };
  var command_reject = { 
    message_class: 'Solicited', 
    message_subclass: 'Status', 
    status_descriptor: 'Command Reject' 
  };
  var atm, settings;

  beforeEach(function() {
    settings = {
      get: function() {
        return {};
      },
      set: function(value){
      }
    };

    log = {
      info: function() {},
      error: function() {}
    };

    atm = new ATM(settings, log);
  });

  describe("atm instance to be defined", function(){
    it("should create atm instance", function() {
      expect(atm).toBeDefined();
    });
  });

  describe("initBuffers()", function(){
    it("should init terminal buffers", function() {
      expect(atm.initBuffers()).toEqual(true);
      expect(atm.PIN_buffer).toEqual('');
      expect(atm.buffer_B).toBeNull();
      expect(atm.buffer_C).toBeNull();
      expect(atm.amount_buffer).toEqual('000000000000');
      expect(atm.opcode_buffer).toEqual('        ');
      expect(atm.FDK_buffer).toEqual('0000000000000');
    });
  });

  describe("parseTrack2()", function(){
    it("should parse track2", function() {
      var track2 = ';4575270595153145=20012211998522600001?';
      var card = {
        number: '4575270595153145',
        service_code: '221',
        track2: ';4575270595153145=20012211998522600001?'
      };
      expect(atm.parseTrack2(track2)).toEqual(card);
    });

    it("should return null if track2 is invalid", function() {
      var track2 = ';4575270595153145D200?';
      expect(atm.parseTrack2(track2)).toBeNull();
    });
  });

  describe("processHostMessage()", function(){
    it("should return false on empty message", function() {
      var host_message = {};
      expect(atm.processHostMessage(host_message)).toEqual(false);
    });

    
    // Terminal Command     
    it("should respond with 'Command Reject' message to unknown Terminal Command host message", function() {
      var host_message = {
        message_class: 'Terminal Command',
        command_code: 'IDDQD',
      };

      expect(atm.status).toEqual('Offline');
      expect(atm.processHostMessage(host_message)).toEqual(command_reject);
      expect(atm.status).toEqual('Offline');      
    });

    it("should process 'Go out-of-service' message properly and respond with 'Ready' message", function() {
      var host_message = {
        message_class: 'Terminal Command',
        command_code: 'Go out-of-service',
      };

      expect(atm.status).toEqual('Offline');
      expect(atm.processHostMessage(host_message)).toEqual(status_ready);
      expect(atm.status).toEqual('Out-Of-Service');      
    });

    it("should process 'Go in-service' message properly and respond with 'Ready' message", function() {
      var host_message = {
        message_class: 'Terminal Command',
        command_code: 'Go in-service',
      };

      expect(atm.status).toEqual('Offline');
      expect(atm.processHostMessage(host_message)).toEqual(status_ready);
      expect(atm.status).toEqual('In-Service');      
    });

    // Data Command     
    it("should respond with 'Command Reject' message to unknown Data Command host message", function() {
      var host_message = {
        message_class: 'Data Command',
        command_code: 'IDDQD',
      };

      expect(atm.processHostMessage(host_message)).toEqual(command_reject);
    }); 

    it("should respond with 'Command Reject' message to invalid 'State Tables load' host message", function() {
      var host_message = {
        message_class: 'Data Command',
        message_subclass: 'Customization Command',
      };

      expect(atm.processHostMessage(host_message)).toEqual(command_reject);
    }); 


    it("should respond with 'Ready' message to 'State Tables load' host message", function() {
      var host_message = {
        message_class: 'Data Command',
        message_subclass: 'Customization Command',
        message_identifier: 'State Tables load',
        states: '001K003004004127127127127127'
      };

      expect(atm.processHostMessage(host_message)).toEqual(status_ready);
    }); 
  });

  describe("setOpCodeBuffer()", function(){
    it("should clear opcode buffer completely", function() {
      /**
       * Specifies bytes of Operation Code buffer to be cleared to graphic ‘space’. Each bit relates to a byte
       * in the Operation Code buffer. If a bit is zero, the corresponding entry is cleared. If a bit is one, the
       * corresponding entry is unchanged. 
       */
      atm.opcode_buffer = 'XXXXXXXX'
      var stateD ={ 
        clear_mask: '000',  // 0000 0000
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(atm.opcode_buffer).toEqual('XXXXXXXX');
      expect(atm.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(atm.opcode_buffer).toEqual('        ');
    });

    it("should left opcode buffer untouched", function() {
      atm.opcode_buffer = 'XXXXXXXX'
      var stateD = { 
        clear_mask: '255',  // 1111 1111
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(atm.opcode_buffer).toEqual('XXXXXXXX');
      expect(atm.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(atm.opcode_buffer).toEqual('XXXXXXXX');
    });

    it("should clear only the left half of opcode buffer", function() {
      atm.opcode_buffer = 'ZZZZZZZZ'
      var stateD = { 
        clear_mask: '240', // 1111 0000
        A_preset_mask: '000',
        B_preset_mask: '000',
        C_preset_mask: '000',
        D_preset_mask: '000',
        extension_state: '000' 
      };

      expect(atm.opcode_buffer).toEqual('ZZZZZZZZ');
      expect(atm.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(atm.opcode_buffer).toEqual('    ZZZZ');
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

      expect(atm.opcode_buffer).toEqual('        ');
      expect(atm.setOpCodeBuffer(stateD)).toBeTruthy();
      expect(atm.opcode_buffer).toEqual(' CCB B  ');
    });
  });
});
