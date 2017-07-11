describe("States", function() {
  var States = require('../../src/states.js');
  var s;

  beforeEach(function() {
    s = new States();
  });

  describe("addState()", function(){
      it("should return false if state is incorrect", function() {
        expect(s.addState('')).toEqual(false);
      });
  });
});
