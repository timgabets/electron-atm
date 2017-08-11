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
      expect(atm.buffer_B).toEqual('');
      expect(atm.buffer_C).toEqual('');
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

      expect(atm.opcode_buffer).toEqual('        ');
      expect(atm.setOpCodeBuffer(stateD, stateZ)).toBeTruthy();
      expect(atm.opcode_buffer).toEqual('I HIHHGF');
    });
  });

  describe("processTransactionRequestState()", function(){
    beforeEach(function() {
      atm.transaction_request = null;
      atm.opcode_buffer = 'ZZZZZZZZ';
      atm.track2 = '8990011234567890=20062011987612300720';
      atm.amount_buffer = '000000001337';
      atm.buffer_B = 'XZXZXZXZXZX';
      atm.buffer_C = '19671994';
    });

    it("should properly fill transaction request data when send_operation_code is enabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_operation_code: '001', 
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.opcode_buffer).toEqual(atm.opcode_buffer);
    });

    it("should properly fill transaction request data when send_operation_code is disabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        description: 'Transaction request state',
        send_operation_code: '000', 
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.opcode_buffer).toBeUndefined();
    });

    it("should properly fill transaction request data when send_track2 is enabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_track2: '001', 
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.track2).toEqual(atm.track2);
    });

    it("should properly fill transaction request data when send_track2 is disabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_track2: '000',
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.track2).toBeUndefined();
    });

    it("should properly fill transaction request data when send_amount_data is enabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_amount_data: '001',
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.amount_buffer).toEqual(atm.amount_buffer);
    });

    it("should properly fill transaction request data when send_amount_data is disabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_amount_data: '000', 
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.amount_buffer).toBeUndefined();
    });

    it("should properly fill transaction request data when send_pin_buffer is disabled (Standard format)", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_pin_buffer: '000',
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.PIN_buffer).toBeUndefined();
    });

    it("should properly fill transaction request data when send_pin_buffer is enabled (Standard format)", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_pin_buffer: '001',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.PIN_buffer).toBeDefined();
      expect(atm.transaction_request.PIN_buffer.length).toEqual(16);
    });

    it("should properly fill transaction request data when send_pin_buffer is disabled (Extended format)", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_pin_buffer: '128',
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.PIN_buffer).toBeUndefined();
    });

    it("should properly fill transaction request data when send_pin_buffer is enabled (Extended format)", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_pin_buffer: '129',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.PIN_buffer).toBeDefined();
      expect(atm.transaction_request.PIN_buffer.length).toEqual(16);
    });

    it("should properly fill transaction request data when send_buffer_B_buffer_C is 000", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_buffer_B_buffer_C: '000',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.buffer_B).toBeUndefined();
      expect(atm.transaction_request.buffer_C).toBeUndefined();
    });

    it("should properly fill transaction request data when send_buffer_B_buffer_C is 001", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_buffer_B_buffer_C: '001',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.buffer_B).toEqual(atm.buffer_B);
      expect(atm.transaction_request.buffer_C).toBeUndefined();
    });

    it("should properly fill transaction request data when send_buffer_B_buffer_C is 002", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_buffer_B_buffer_C: '002',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.buffer_B).toBeUndefined();
      expect(atm.transaction_request.buffer_C).toEqual(atm.buffer_C);
    });

    it("should properly fill transaction request data when send_buffer_B_buffer_C is 003", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_buffer_B_buffer_C: '003',
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.buffer_B).toEqual(atm.buffer_B);
      expect(atm.transaction_request.buffer_C).toEqual(atm.buffer_C);
    });

    it("should create Unsolicited Transaction Request message object", function(){
      var state = {
        number: '027', 
        type: 'I', 
      };

      atm.processTransactionRequestState(state);
      expect(atm.transaction_request.message_class).toEqual('Unsolicited');
      expect(atm.transaction_request.message_subclass).toEqual('Transaction Request');
    });
  });

  describe("processPinpadButtonPressed()", function(){
    beforeEach(function() {
      atm.current_state = { 
        number: '230', 
        type: 'B'
      };

      spyOn(atm, 'processState');

      atm.max_pin_length = 6;
      atm.initBuffers();
    });

    it("should put the entered numbers into PIN buffer on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');

      expect(atm.PIN_buffer).toEqual('1985');
    })

    it("should properly handle pressed Backspace button on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('3');

      expect(atm.PIN_buffer).toEqual('5893');
    })

    it("should properly handle pressed Enter button on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('3');

      expect(atm.PIN_buffer).toEqual('5893');
      expect(atm.processState).not.toHaveBeenCalled();
    })

    it("should call processState() when 6 digits entered on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('3');

      expect(atm.PIN_buffer).toEqual('198593');
      expect(atm.processState).toHaveBeenCalled();
    })

    it("should call processState() when 4 digits PIN entered + Enter button pressed on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('enter');

      expect(atm.PIN_buffer).toEqual('9855');
      expect(atm.processState).toHaveBeenCalled();
    })

    it("should not call processState() when PIN buffer is less than 4 on state B", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('enter');
      atm.processPinpadButtonPressed('enter');
      atm.processPinpadButtonPressed('enter');

      expect(atm.PIN_buffer).toEqual('1');
      expect(atm.processState).not.toHaveBeenCalled();
    })    
  })

  describe("setFDKsActiveMask()", function(){
    it("FDK mask 000 should enable disable all the buttons", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('000');
      expect(atm.activeFDKs).toEqual([]);
    });

    it("FDK mask 060 should enable C, D, F and G buttons", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('060');
      expect(atm.activeFDKs).toEqual(['C', 'D', 'F', 'G']);
    });

    it("FDK mask 255 should enable all the buttons", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('255');
      expect(atm.activeFDKs).toEqual(['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I']);
    });

    it("should leave the current FDK mask unchanged if new FDK mask is invalid", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('129');
      expect(atm.activeFDKs).toEqual(['A', 'I']);
      atm.setFDKsActiveMask('666');
      expect(atm.activeFDKs).toEqual(['A', 'I']);
    });
  });

  describe("isFDKButtonActive()", function(){
    it("should return undefined if button value is not provided", function(){
      expect(atm.isFDKButtonActive()).toBeUndefined();
    });

    it("should perform case-insensitive check through active FDKs", function(){
      atm.setFDKsActiveMask('129');
      expect(atm.activeFDKs).toEqual(['A', 'I']);
      expect(atm.isFDKButtonActive('a')).toBeTruthy();
      expect(atm.isFDKButtonActive('A')).toBeTruthy();

      expect(atm.isFDKButtonActive('i')).toBeTruthy();
      expect(atm.isFDKButtonActive('I')).toBeTruthy();
      
      expect(atm.isFDKButtonActive('d')).toBeFalsy();
      expect(atm.isFDKButtonActive('D')).toBeFalsy();
    })
  });
});
