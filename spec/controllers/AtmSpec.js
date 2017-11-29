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



  describe('getSupplyCounters()', function(){
    it('should get supply counters', function(){
      // TODO:
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
