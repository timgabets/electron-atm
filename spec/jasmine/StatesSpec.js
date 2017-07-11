describe("States", function() {
  var States = require('../../src/states.js');
  var s;

  beforeEach(function() {
    s = new States();
  });

  describe("parseState()", function(){
      it("should parse valid state properly", function() {
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
});
