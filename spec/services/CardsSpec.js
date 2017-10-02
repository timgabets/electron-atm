describe("CardsService", function() {
  var CardsService = require('../../src/services/cards.js');
  var settings, s;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };
    
    settings = {
      get: function() {
        return {};
      },
      set: function(value){
      }
    };

    spyOn(settings, 'set');
    s = new CardsService(settings, log);
  });

  describe('add()', function(){
    it('should add a card', function(){
      var card = {
        name: 'Test Card',
        number: '4444555566667777',
        expiry_date: '1212',
        service_code: '101',
        pvki: '1',
        pvv: '1234',
        cvv: '567'
      }
      expect(s.add(card)).toBeTruthy();
      expect(settings.set).toHaveBeenCalled();
      expect(s.get('Test Card')).toEqual(card);
    });

    it('should add a card without name', function(){
      var card = {
        number: '4444555566667777',
        expiry_date: '1212',
        service_code: '101',
        pvki: '1',
        pvv: '1234',
        cvv: '567'
      }
      expect(s.add(card)).toBeTruthy();
      expect(settings.set).toHaveBeenCalled();
      expect(s.get('4444555566667777')).toEqual(card);
    });
  });
});
