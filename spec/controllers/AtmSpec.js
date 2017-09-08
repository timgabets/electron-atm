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
    var s = {};
    settings = {
      get: function(item) {
        if(s[item])
          return s[item]
        else
          return {};
      },
      set: function(item, value){
        s[item] = value;
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
      expect(atm.FDK_buffer).toEqual('');
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
      
      // PIN block related data
      atm.PIN_buffer = '1234';
      atm.card = {number: '4000001234562000'};
      atm.initKeys();
      atm.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
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

  describe("processPinpadButtonPressed() for state B", function(){
    beforeEach(function() {
      atm.current_state = { 
        number: '230', 
        type: 'B'
      };

      spyOn(atm, 'processState');

      atm.max_pin_length = 6;
      atm.initBuffers();
    });

    it("should put the entered numbers into PIN buffer", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');

      expect(atm.PIN_buffer).toEqual('1985');
    })

    it("should properly handle pressed Backspace button", function(){
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

    it("should properly handle pressed Enter button", function(){
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

    it("should call processState() when 6 digits entered", function(){
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

    it("should call processState() when 4 digits PIN entered + Enter button pressed", function(){
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

    it("should not call processState() when PIN buffer is less than 4", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('enter');
      atm.processPinpadButtonPressed('enter');
      atm.processPinpadButtonPressed('enter');

      expect(atm.PIN_buffer).toEqual('1');
      expect(atm.processState).not.toHaveBeenCalled();
    })    
  });

  describe("processPinpadButtonPressed() for state F", function(){
    beforeEach(function() {
      atm.current_state = { 
        number: '700', 
        type: 'F'
      };

      spyOn(atm, 'processState');

      atm.initBuffers();
    });

    it("should put the entered numbers into amount buffer", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');

      expect(atm.amount_buffer).toEqual('000000001985');
    })

    it("should properly handle pressed Backspace button", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      
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

      expect(atm.amount_buffer).toEqual('000000005893');
    })

    it("should properly handle pressed Enter button", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('enter');

      expect(atm.amount_buffer).toEqual('000000009855');
      expect(atm.processState).toHaveBeenCalled();
    });

    it("should not overflow amount buffer", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('6');
      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');

      expect(atm.amount_buffer).toEqual('345678901234');
    });
  });

  describe("processPinpadButtonPressed() for state H", function(){
    beforeEach(function() {
      atm.current_state = { 
        number: '700', 
        type: 'H',
        FDK_A_next_state: '001',
        FDK_B_next_state: '002',
        FDK_C_next_state: '003',
        FDK_D_next_state: '004',
        buffer_and_display_params: '000', // Display 'X' for each numeric key pressed. Store data in general-purpose Buffer C
      };

      spyOn(atm, 'processState');

      atm.initBuffers();
    });

    it("should put the entered numbers into buffer C", function(){
      expect(atm.buffer_C).toEqual('');

      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('5');

      expect(atm.buffer_C).toEqual('1985');
    });

    it("should properly handle pressed Backspace button", function(){
      expect(atm.buffer_C).toEqual('');
      
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

      expect(atm.buffer_C).toEqual('5893');
    });

    it("should put the entered numbers into buffer C when buffer_and_display_params = 001", function(){
      atm.current_state.buffer_and_display_params = '001';
      expect(atm.buffer_C).toEqual('');

      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('4');

      expect(atm.buffer_C).toEqual('794');
    });

    it("should put the entered numbers into buffer B when buffer_and_display_params = 002", function(){
      atm.current_state.buffer_and_display_params = '002';
      expect(atm.buffer_B).toEqual('');

      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('4');

      expect(atm.buffer_B).toEqual('7984');
    });

    it("should put the entered numbers into buffer B when buffer_and_display_params = 003", function(){
      atm.current_state.buffer_and_display_params = '003';
      expect(atm.buffer_B).toEqual('');

      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('backspace');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('4');
      atm.processPinpadButtonPressed('4');
      atm.processPinpadButtonPressed('0');

      expect(atm.buffer_B).toEqual('98440');
    });


    it("should not overflow buffer C", function(){
      atm.current_state.buffer_and_display_params = '001';
      expect(atm.buffer_C).toEqual('');

      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('6');
      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');

      expect(atm.buffer_C).toEqual('123456789012');
    });

    it("should not overflow buffer B", function(){
      atm.current_state.buffer_and_display_params = '003';
      expect(atm.buffer_B).toEqual('');

      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');
      atm.processPinpadButtonPressed('5');
      atm.processPinpadButtonPressed('6');
      atm.processPinpadButtonPressed('7');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('9');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('3');
      atm.processPinpadButtonPressed('4');

      expect(atm.buffer_B).toEqual('123456789012');
    });

  });


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

    it("FDK mask 0100010000 should enable buttons A, E (Cancel) and F", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('0100011000');
      expect(atm.activeFDKs).toEqual(['A', 'E', 'F']);
    });

    it("FDK mask 0111111111 should enable all the buttons", function(){
      expect(atm.activeFDKs).toEqual([]);
      atm.setFDKsActiveMask('0111111111');
      expect(atm.activeFDKs).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
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

  describe("setAmountBuffer()", function(){
    it("should set amount buffer", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      atm.setAmountBuffer('15067');
      expect(atm.amount_buffer).toEqual('000000015067');
    })

    it("should leave amount buffer unchanged if no value provided", function(){
      expect(atm.amount_buffer).toEqual('000000000000');
      atm.setAmountBuffer('15067');
      expect(atm.amount_buffer).toEqual('000000015067');
      atm.setAmountBuffer();
      expect(atm.amount_buffer).toEqual('000000015067');
    })
  });

  describe("processStateX()", function(){
    it("should set amount buffer properly when A button pressed", function(){
      state = { 
        number: '037', 
        type: 'X',
        description: 'FDK information entry state',
        screen_number: '037', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '038', 
        extension_state: '037', 
        buffer_id: '033',  // amount buffer, 3 zeroes
        FDK_active_mask: '255',
        states_to: [ '002', '131', '038' ]
      };
  
      extension_state = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] 
      };

      atm.buttons_pressed.push('A');
      expect(atm.amount_buffer).toEqual('000000000000');
      atm.processStateX(state, extension_state);
      expect(atm.amount_buffer).toEqual('000000150000');
    });

    it("should set amount buffer properly when B button pressed", function(){
      state = { 
        number: '037', 
        type: 'X',
        description: 'FDK information entry state',
        screen_number: '037', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '038', 
        extension_state: '037', 
        buffer_id: '039',  // amount buffer, 9 zeroes
        FDK_active_mask: '255',
        states_to: [ '002', '131', '038' ]
      };
  
      extension_state = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] 
      };

      atm.buttons_pressed.push('B');
      expect(atm.amount_buffer).toEqual('000000000000');
      atm.processStateX(state, extension_state);
      expect(atm.amount_buffer).toEqual('250000000000');
    });

    it("should set buffer B properly", function(){
      state = { 
        number: '037', 
        type: 'X',
        description: 'FDK information entry state',
        screen_number: '037', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '038', 
        extension_state: '037', 
        buffer_id: '010',  // buffer B, no zeroes
        FDK_active_mask: '255',
        states_to: [ '002', '131', '038' ]
      };
  
      extension_state = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] 
      };

      atm.buttons_pressed.push('C');      
      expect(atm.buffer_B).toEqual('');
      atm.processStateX(state, extension_state);
      expect(atm.buffer_B).toEqual('400');
    });

    it("should set buffer C properly", function(){
      state = { 
        number: '037', 
        type: 'X',
        description: 'FDK information entry state',
        screen_number: '037', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '038', 
        extension_state: '037', 
        buffer_id: '021',  // buffer B, 1 zero
        FDK_active_mask: '255',
        states_to: [ '002', '131', '038' ]
      };
  
      extension_state = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', '150', '250', '400', '600', '000', '100', '050', '020' ] 
      };

      atm.buttons_pressed.push('D');      
      expect(atm.buffer_C).toEqual('');
      atm.processStateX(state, extension_state);
      expect(atm.buffer_C).toEqual('6000');
    });
  });


  describe("processFourFDKSelectionState()", function(){
    it("should set active FDK", function(){
      var state = { 
        number: '141', 
        type: 'E',
        description: 'Four FDK selection state',
        screen_number: '141', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '255', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '571', 
        FDK_D_next_state: '132', 
        buffer_location: '000',
      };

      expect(atm.activeFDKs).toEqual([]);
      atm.processFourFDKSelectionState(state);
      expect(atm.activeFDKs).toEqual(['C', 'D']);
    })

    it("should put the pressed button into the opcode buffer", function(){
      var state = { 
        number: '141', 
        type: 'E',
        description: 'Four FDK selection state',
        screen_number: '141', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '255', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '571', 
        FDK_D_next_state: '132', 
        buffer_location: '000',
      };

      expect(atm.opcode_buffer).toEqual('        ');

      atm.buttons_pressed.push('C');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode_buffer).toEqual('       C');
    })

    it("should put the pressed button into the opcode buffer", function(){
      var state = { 
        number: '141', 
        type: 'E',
        description: 'Four FDK selection state',
        screen_number: '141', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '255', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '571', 
        FDK_D_next_state: '132', 
        buffer_location: '006',
      };

      expect(atm.opcode_buffer).toEqual('        ');

      atm.buttons_pressed.push('D');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode_buffer).toEqual(' D      ');
    })

    it("should leave opcode buffer unchanged if buffer location value is invalid", function(){
      var state = { 
        number: '141', 
        type: 'E',
        description: 'Four FDK selection state',
        screen_number: '141', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '255', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '571', 
        FDK_D_next_state: '132', 
        buffer_location: '008',
      };

      expect(atm.opcode_buffer).toEqual('        ');
      atm.buttons_pressed.push('D');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode_buffer).toEqual('        ');
    })
  })

  describe('getEncryptedPIN()', function(){
    beforeEach(function() {
      atm.PIN_buffer = '1234';
      atm.card = {number: '4000001234562000'};
      atm.initKeys();
      atm.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should get encrypted PIN', function(){
      expect(atm.getEncryptedPIN()).toEqual('<3;:1>04=88654<4');
    });

    it('should return null if no terminal key', function(){
      atm.initKeys();      
      atm.setTerminalKey(undefined);
      expect(atm.getEncryptedPIN()).toBeNull();
    });    
  });

  describe('dec2hex()', function(){
    it('should convert decimal string to hex string', function(){
      expect(atm.dec2hex('040198145193087203201076202216192211251240251237')).toEqual('28C691C157CBC94CCAD8C0D3FBF0FBED');
    });

    it('should convert decimal string to hex string', function(){
      expect(atm.dec2hex('000001002003004005006007008009010011012013014015')).toEqual('000102030405060708090A0B0C0D0E0F');
    });
  });

  describe('setCommsKey()', function(){
    beforeEach(function() {
      atm.initKeys();
      atm.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      atm.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
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

      expect(atm.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
      expect(atm.setCommsKey(data.new_key_data, data.new_key_length)).toBeTruthy()
      expect(atm.getTerminalKey()).toEqual(['7B278B03B439DDCACF8B3333AC591BCA', '41DD5C']);
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

      atm.initKeys();
      atm.setMasterKey(null) ;
      expect(atm.setCommsKey(data.new_key_data, data.new_key_length)).toBeFalsy()
    })
  });

  describe('getMessageCoordinationNumber', function(){
    it('should return proper message coordination number', function(){
      settings.set('message_coordination_number', '0');

      // ASCII code 49 
      expect(atm.getMessageCoordinationNumber()).toEqual('1');
      // 50
      expect(atm.getMessageCoordinationNumber()).toEqual('2');

      for (var i =0; i < 10; i++ )
        atm.getMessageCoordinationNumber();

      // 61
      expect(atm.getMessageCoordinationNumber()).toEqual('=');
    });

    it('should rotate message coordination number', function(){
      settings.set('message_coordination_number', '0');
      expect(atm.getMessageCoordinationNumber()).toEqual('1');
      for (var i =0; i < 75; i++ )
        atm.getMessageCoordinationNumber();

      expect(atm.getMessageCoordinationNumber()).toEqual('}');
      expect(atm.getMessageCoordinationNumber()).toEqual('~');
      // End of cycle, should start over again
      expect(atm.getMessageCoordinationNumber()).toEqual('1');
      expect(atm.getMessageCoordinationNumber()).toEqual('2');
    });
  });

  describe('getTerminalKey() and getMasterKey()', function(){
    beforeEach(function() {
      atm.initKeys();
      atm.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      atm.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it('should get terminal key', function(){
      expect(atm.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
    });

    it('should get master key', function(){
      expect(atm.getMasterKey()).toEqual(['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
    });
  });

  describe('setTerminalKey() and setMasterKey()', function(){
    beforeEach(function() {
      atm.initKeys();
      atm.setMasterKey('B6D55EABAD23BC4FD558F8D619A21C34');
      atm.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
      spyOn(settings, 'set');
    });

    it('should set terminal key', function(){
      expect(atm.getTerminalKey()).toEqual(['DEADBEEFDEADBEEFDEADBEEFDEADBEEF', '2AE358']);
      atm.setTerminalKey('B667E96A6D5C961CB667E96A6D5C961C');
      expect(atm.getTerminalKey()).toEqual(['B667E96A6D5C961CB667E96A6D5C961C', '900A01']);
      expect(settings.set).toHaveBeenCalled();
    });

    it('should set master key', function(){
      expect(atm.getMasterKey()).toEqual(['B6D55EABAD23BC4FD558F8D619A21C34', '55531F']);
      atm.setMasterKey('D2C4E412AE89A92AD2C4E412AE89A92A');
      expect(atm.getMasterKey()).toEqual(['D2C4E412AE89A92AD2C4E412AE89A92A', '58E506']);
      expect(settings.set).toHaveBeenCalled();
    });
  });

  describe('getKeyCheckValue()', function(){
    it('should return key check value', function(){
      expect(atm.getKeyCheckValue('DEADBEEFDEADBEEFDEADBEEFDEADBEEF')).toEqual('2AE358');
    })
  });

  describe('setConfigID() and getConfigID()', function(){
    beforeEach(function() {
      atm.initCounters();
      atm.setConfigID('0000');
      spyOn(settings, 'set');
    });

    it('should set ConfigID', function(){
      expect(atm.getConfigID()).toEqual('0000');
      atm.setConfigID('0003');
      expect(atm.getConfigID()).toEqual('0003');
      expect(settings.set).toHaveBeenCalled();
    });
  });

  describe('getSupplyCounters()', function(){
    it('should get supply counters', function(){
      // TODO:
    });
  });

  describe('replySolicitedStatus()', function(){
    it('should get reply to \'Send Supply Counters\' terminal command', function(){
      var reply = atm.replySolicitedStatus('Terminal State', 'Send Supply Counters');

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');
      expect(reply.message_subclass).toEqual('Status');

      expect(reply.tsn).toEqual('0000');
      expect(reply.transaction_count).toEqual('0000000');
      expect(reply.notes_in_cassettes).toEqual('00011000220003300044');
      expect(reply.notes_rejected).toEqual('00000000000000000000');
      expect(reply.notes_dispensed).toEqual('00000000000000000000');
      expect(reply.last_trxn_notes_dispensed).toEqual('00000000000000000000');
      expect(reply.card_captured).toEqual('00000');
      expect(reply.envelopes_deposited).toEqual('00000');
      expect(reply.camera_film_remaining).toEqual('00000');
      expect(reply.last_envelope_serial).toEqual('00000');
    });
  });  
});
