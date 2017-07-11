describe("States", function() {
  var States = require('../../src/states.js');
  var s;

  beforeEach(function() {
    s = new States();
  });

  describe("parseState()", function(){
      it("should parse state A properly", function() {
        var parsed = { 
          number: '000', 
          type: 'A', 
          screen_number: '870', 
          good_read_next_state: '500', 
          error_screen_number: '128', 
          read_condition_1: '002', 
          read_condition_2: '002', 
          read_condition_3: '002', 
          card_return_flag: '001', 
          no_fit_match_next_state: '127' 
        };
        expect(s.parseState('000A870500128002002002001127')).toEqual(parsed);
      });

      it("should parse state K properly", function() {
        var parsed = { 
          number: '001', 
          type: 'K', 
          states: [ '003', '004', '004', '127', '127', '127', '127', '127' ] 
        };
        expect(s.parseState('001K003004004127127127127127')).toEqual(parsed);        
      });

      it("should throw error if state data is invalid", function() {
        expect(s.parseState('000"8')).toEqual(null);
      });
  });

  describe("addState()", function(){
      it("should return false while passing empty data", function() {
        expect(s.addState('')).toEqual(false);
      });

      it("should add valid state", function() {
        var parsed = { 
          number: '000', 
          type: 'A', 
          screen_number: '870', 
          good_read_next_state: '500', 
          error_screen_number: '128', 
          read_condition_1: '002', 
          read_condition_2: '002', 
          read_condition_3: '002', 
          card_return_flag: '001', 
          no_fit_match_next_state: '127' 
        };

        expect(s.addState('000A870500128002002002001127')).toEqual(true);
        expect(s.getState('000')).toEqual(parsed);

      });
  });

  /*
  describe("addStates()", function(){
      it("should add states", function() {
        var states = ['000A870500128002002002001127', '001K003004004127127127127127', '002J132000132136132000081178', '003D024000128000000000000000', '004D024000000128000000000000'];
        expect(s.addStates(states)).toEqual(true);
      });
  });
  */
});
