describe("ATM", function() {
  var ATM = require('../../src/controllers/atm.js');
  var atm;
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


  beforeEach(function() {
    atm = new ATM();
  });

  describe("processHostMessage()", function(){
    it("should return false on empty message", function() {
      var host_message = {};
      expect(atm.processHostMessage(host_message)).toEqual(false);
    });

    /**
     * Terminal Command 
     */
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

    /**
     * Data Command
     */
    it("should respond with 'Command Reject' message to unknown Data Command host message", function() {
      var host_message = {
        message_class: 'Data Command',
        command_code: 'IDDQD',
      };

      expect(atm.processHostMessage(host_message)).toEqual(command_reject);
    }); 
  });
});
