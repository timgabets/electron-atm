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
        hardware_fitness: '00000000000000000000000000000000000000',
        hardware_configuration: '157F000901020483000001B1000000010202047F7F00',
        supplies_status: '00000000000000000000000000',
        sensor_status: '000000000000',
        release_number: '030300',
        ndc_software_id: 'G531‐0283'
      };
      expect(atm.getTerminalStateReply('Send Configuration Information')).toEqual(reply);    
    })
  });
});
