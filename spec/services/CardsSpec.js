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
    it('should get AMEX 34 payment scheme', function(){
      expect(s.getPaymentScheme('34')).toEqual('AMEX');
    });

    it('should not resolve 3527', function(){
      expect(s.getPaymentScheme('3527')).toBeUndefined();
    });        

    it('should resolve 3528 as JSB Payment scheme', function(){
      expect(s.getPaymentScheme('3528')).toEqual('JCB');
    });    

    it('should resolve 3555 as JSB Payment scheme', function(){
      expect(s.getPaymentScheme('3555')).toEqual('JCB');
    });  

    it('should resolve 3589 as JSB Payment scheme', function(){
      expect(s.getPaymentScheme('3589')).toEqual('JCB');
    });  

    it('should resolve 3589 as JSB Payment scheme', function(){
      expect(s.getPaymentScheme('3590')).toBeUndefined();
    });  

    it('should get AMEX 37 payment scheme', function(){
      expect(s.getPaymentScheme('37')).toEqual('AMEX');
    });

    it('should resolve 50 as Maestro', function(){
      expect(s.getPaymentScheme('50')).toEqual('Maestro');
    });

    it('should resolve 51 as Mastercard', function(){
      expect(s.getPaymentScheme('51')).toEqual('Mastercard');
    });

    it('should resolve 52 as Mastercard', function(){
      expect(s.getPaymentScheme('52')).toEqual('Mastercard');
    });

    it('should resolve 53 as Mastercard', function(){
      expect(s.getPaymentScheme('53')).toEqual('Mastercard');
    });

    it('should resolve 54 as Mastercard', function(){
      expect(s.getPaymentScheme('54')).toEqual('Mastercard');
    });

    it('should resolve 55 as Mastercard', function(){
      expect(s.getPaymentScheme('55')).toEqual('Mastercard');
    });

    it('should resolve 56 as Maestro', function(){
      expect(s.getPaymentScheme('56')).toEqual('Maestro');
    });

    it('should resolve 57 as Maestro', function(){
      expect(s.getPaymentScheme('57')).toEqual('Maestro');
    });

    it('should resolve 58 as Maestro', function(){
      expect(s.getPaymentScheme('58')).toEqual('Maestro');
    });

    it('should get Mastercard payment scheme', function(){
      expect(s.getPaymentScheme('62')).toEqual('CUP');
    });

    it('should get Discover 64 payment scheme', function(){
      expect(s.getPaymentScheme('64')).toEqual('Discover');
    });

    it('should get Discover 65 payment scheme', function(){
      expect(s.getPaymentScheme('65')).toEqual('Discover');
    });

    it('should resolve 4 as VISA', function(){
      expect(s.getPaymentScheme('4')).toEqual('VISA');
    });    

    it('should resolve 40 as VISA', function(){
      expect(s.getPaymentScheme('40')).toEqual('VISA');
    });    

    it('should resolve 49 as VISA', function(){
      expect(s.getPaymentScheme('49')).toEqual('VISA');
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
