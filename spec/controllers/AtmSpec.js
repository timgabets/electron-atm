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
      expect(atm.opcode.getBuffer()).toEqual('        ');
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

  describe("processTransactionRequestState()", function(){
    beforeEach(function() {
      atm.transaction_request = null;
      atm.opcode.set('ZZZZZZZZ');
      atm.track2 = '8990011234567890=20062011987612300720';
      atm.amount_buffer = '000000001337';
      atm.buffer_B = 'XZXZXZXZXZX';
      atm.buffer_C = '19671994';
      
      // PIN block related data
      atm.PIN_buffer = '1234';
      atm.card = {number: '4000001234562000'};
      atm.crypto.setTerminalKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEF');
    });

    it("should properly fill transaction request data when send_operation_code is enabled", function(){
      var state = {
        number: '027', 
        type: 'I', 
        send_operation_code: '001', 
      };

      atm.processTransactionRequestState(state)
      expect(atm.transaction_request.opcode_buffer).toEqual(atm.opcode.getBuffer());
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
    });

    it("should clear PIN Buffer when Esc pressed", function(){
      expect(atm.PIN_buffer).toEqual('');
      
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      atm.processPinpadButtonPressed('8');
      atm.processPinpadButtonPressed('esc');

      expect(atm.PIN_buffer).toEqual('');
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


    it("should not overflow buffer C (32 bytes max)", function(){
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
      // 10
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
      // 20
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
      // 30
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      // 32. The rest must be trimmed
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');

      expect(atm.buffer_C).toEqual('12345678901234567890123456789012');
    });

    it("should not overflow buffer B (32 bytes max)", function(){
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
      // 10
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
      // 20
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
      // 30
      atm.processPinpadButtonPressed('1');
      atm.processPinpadButtonPressed('2');
      // 32. The rest must be trimmed
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');
      atm.processPinpadButtonPressed('0');

      expect(atm.buffer_B).toEqual('12345678901234567890123456789012');
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

      expect(atm.opcode.getBuffer()).toEqual('        ');

      atm.buttons_pressed.push('C');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode.getBuffer()).toEqual('       C');
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

      expect(atm.opcode.getBuffer()).toEqual('        ');

      atm.buttons_pressed.push('D');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode.getBuffer()).toEqual(' D      ');
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

      expect(atm.opcode.getBuffer()).toEqual('        ');
      atm.buttons_pressed.push('D');
      atm.processFourFDKSelectionState(state);
      expect(atm.opcode.getBuffer()).toEqual('        ');
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

    it('should get reply to \'Send Configuration ID\' terminal command', function(){
      atm.setConfigID('0007');
      var reply = atm.replySolicitedStatus('Terminal State', 'Send Configuration ID');
      
      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');

      expect(reply.config_id).toEqual('0007');
    });
  });

  describe('processCustomizationCommand()', function(){
    it('should reply with \'Ready\' to Screen Data load command', function(){
      data = {
        message_identifier: 'Screen Data load',
        screens: ['screens data'],
      };
      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Ready');            
    });

    it('should reply with \'Command Reject\' to Screen Data load command when no screens data provided', function(){
      data = {
        message_identifier: 'Screen Data load',
      };
      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Command Reject');            
    });

    it('should reply with \'Ready\' to State Tables load command', function(){
      data = {
        message_identifier: 'State Tables load',
        states: ['000A0010020030004005006007008'],
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Ready');            
    });

    it('should reply with \'Command Reject\' to State Tables load command when no valid state tables provided', function(){
      data = {
        message_identifier: 'State Tables load',
        states: ['iddqd'],
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Command Reject');
    });

    it('should reply with \'Ready\' to FIT Data load command', function(){
      data = {
        message_identifier: 'FIT Data load',
        FITs: ['029000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000'],
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Ready');            
    });

    it('should reply with \'Command Reject\' to FIT Data load command when no valid FITs provided', function(){
      data = {
        message_identifier: 'FIT Data load',
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Command Reject');            
    });

    it('should reply with \'Ready\' to proper Configuration ID number load command', function(){
      data = {
        message_identifier: 'Configuration ID number load',
        config_id: ['0043'],
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Ready');            
    });

    it('should reply with \'Command Reject\' to Configuration ID number load command without Config ID', function(){
      data = {
        message_identifier: 'Configuration ID number load',
      };

      var reply = atm.processCustomizationCommand(data);

      expect(reply.message_class).toEqual('Solicited');
      expect(reply.message_subclass).toEqual('Status');    
      expect(reply.status_descriptor).toEqual('Command Reject');            
    });
  });

  describe('getTerminalStateReply()', function(){
    it('should return empty object in case of unknown command code', function(){
      var reply = {};      
      expect(atm.getTerminalStateReply()).toEqual(reply);    
    });

    it('should return config ID in response to \'Send Configuration ID\'', function(){
      atm.setConfigID('0034');

      var reply = {
        terminal_command: 'Send Configuration ID',
        config_id: '0034'
      };      
      expect(atm.getTerminalStateReply('Send Configuration ID')).toEqual(reply);    
    });

    it('should return counters data in response to \'Send Supply Counters\'', function(){
      atm.initCounters();
      var reply = {
        terminal_command: 'Send Supply Counters',
        tsn: '0000',
        transaction_count: '0000000',
        notes_in_cassettes: '00011000220003300044',
        notes_rejected: '00000000000000000000',
        notes_dispensed: '00000000000000000000',
        last_trxn_notes_dispensed: '00000000000000000000',
        card_captured: '00000',
        envelopes_deposited: '00000',
        camera_film_remaining: '00000',
        last_envelope_serial: '00000'
      };      
      expect(atm.getTerminalStateReply('Send Supply Counters')).toEqual(reply);    
    });

    it('should respond to \'Send Configuration Information\'', function(){
      atm.setConfigID('0789');

      var reply = {
        terminal_command: 'Send Configuration Information',
        config_id: '0789',
        hardware_fitness: '0000000000000000000000',
        hardware_configuration: '157F000901020483000001B1000000010202047F7F00',
        supplies_status: '00011111001000011130011',
        sensor_status: '000000000000',
        release_number: '030300',
        ndc_software_id: 'G531‐0283'
      };
      expect(atm.getTerminalStateReply('Send Configuration Information')).toEqual(reply);    
    })
  });
});
