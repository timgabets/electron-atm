describe("Levels", function() {
  var LevelsService = require('../../src/services/levels.js');
  var l;

  beforeEach(function() {
    l = new LevelsService();
  });

  describe('addState()', function(){
    it('should add state to non-existent level', function(){
      expect(l.getStates(0)).toBeUndefined();
      expect(l.addState('300', 0)).toBeTruthy();
      expect(l.getStates(0)).toEqual(['300']);
    });
  });

  describe('getLevelSize()', function(){
    it('should return 0 for non-existent level', function(){
      expect(l.getLevelSize(0)).toEqual(0);
    });

    it('should return proper level size', function(){
      expect(l.addState('903', 3)).toBeTruthy();
      expect(l.addState('783', 3)).toBeTruthy();
      expect(l.getLevelSize(3)).toEqual(2);
    });
  });

  describe('getMaxLevel()', function(){
    it('should get the max level', function(){
      expect(l.addState('903', 17)).toBeTruthy();
      expect(l.addState('783', 4)).toBeTruthy();
      expect(l.addState('903', 9)).toBeTruthy();

      expect(l.getMaxLevel()).toEqual(17);
    });
  });
});