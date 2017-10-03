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

  describe('getPaymentScheme()', function(){
    it('should get VISA payment scheme', function(){
      expect(s.getPaymentScheme('4444555566667777')).toEqual('VISA');
    });

    it('should get Mastercard payment scheme', function(){
      expect(s.getPaymentScheme('555566667777')).toEqual('Mastercard');
    });

    it('should get Mastercard payment scheme', function(){
      expect(s.getPaymentScheme('66667777')).toEqual('CUP');
    });
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
        cvv: '567',
        discretionary_data: '00001'
      }
      expect(s.add(card)).toBeTruthy();
      expect(settings.set).toHaveBeenCalled();
      expect(s.get('Test Card')).toEqual(card);
      expect(s.get('Test Card').scheme).toEqual('VISA');
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

  describe('getNames()', function(){
    it('should return empty array if there is no cards', function(){
      expect(s.cards).toEqual({});

      expect(s.add({
        number: '1111111111111111',
      })).toBeTruthy();

      expect(s.add({
        number: '2222222222222222',
      })).toBeTruthy();

      expect(s.getNames()).toEqual(['1111111111111111', '2222222222222222']);
    });
  });

  describe('getTrack2()', function(){
    it('should return empty array if there is no cards', function(){
      var card = {
        number: '4444555566667777',
        expiry_date: '1212',
        service_code: '101',
        pvki: '1',
        pvv: '1234',
        cvv: '567',
        discretionary_data: '00001'
      }

      expect(s.getTrack2(card)).toEqual('12121011123456700001');
    });
  });

  describe('decorateCardNumber()', function(){
    it('should not decorate empty cardnumber', function(){
      expect(s.decorateCardNumber('')).toEqual('');
    });

    it('should decorate cardnumber', function(){
      expect(s.decorateCardNumber('1111222233334444')).toEqual('1111 2222 3333 4444');
    });

    it('should not decorate already decorated card number',  function(){
      //expect(s.decorateCardNumber('1111 2222 3333 4444')).toEqual('1111 2222 3333 4444');
    });
  }); 


  describe('remove()', function(){
    it('should remove card', function(){

      expect(s.cards).toEqual({});

      expect(s.add({
        number: '1111111111111111',
      })).toBeTruthy();

      expect(s.add({
        number: '2222222222222222',
      })).toBeTruthy();

      expect(s.getNames()).toEqual(['1111111111111111', '2222222222222222']);
      s.remove('1111111111111111');
      expect(s.getNames()).toEqual(['2222222222222222']);
      expect(s.get('1111111111111111')).toBeUndefined();
    });
  })
});
