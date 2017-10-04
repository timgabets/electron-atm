function CardsService(settings, log){
  this.cards = {};
  this.cards = settings.get('cards');
  if(!this.cards)
    this.cards = {};
  
  /**
   * [getPaymentScheme get payment scheme identifire, base on card number. 
   *                Of course, the life is much more complicated, and there are BIN tables
   *                for that purposes, but here we are just have a naive implementation, 
   *                based on the checking the first digit of the card number]
   * @param  {[type]} cardnumber [description]
   * @return {[type]}            [description]
   */
  this.getPaymentScheme = function(cardnumber){
    if(cardnumber[0] === '4')
      return 'VISA';

    switch(cardnumber.substr(0, 2)){
      case '34':
        return 'AMEX';

      case '35':
        // 3528-3589
        if( cardnumber.substr(2, 2) >= '28' && cardnumber.substr(2, 2) <= '89')
          return 'JCB';
        break;

      case '37':
        return 'AMEX';

      case '50':
        return 'Maestro';

      case '51':
      case '52':
      case '53':
      case '54':
      case '55':
        return 'Mastercard';

      case '56':
      case '57':
      case '58':
        return 'Maestro';

      case '62':
        return 'CUP';
      
      case '64':
      case '65':
        return 'Discover';
    }
  };

  /**
   * [add description]
   * @param {[type]} card [description]
   */
  this.add = function(card){
    card.name = this.decorateCardNumber(card.number);

    var scheme = this.getPaymentScheme(card.number);
    if(scheme)
      card.scheme = scheme;

    this.cards[card.number] = card;
    settings.set('cards', this.cards);

    return true;
  };

  /**
   * [remove description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  this.remove = function(name){
    this.cards[name] = undefined;
  }

  /**
   * [get description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  this.get = function(name){
    return this.cards[name];
  };

  /**
   * [getNames description]
   * @return {[type]} [description]
   */
  this.getNames = function(){
    var names = [];

    for (var card in this.cards)
      if (this.cards.hasOwnProperty(card) && this.cards[card])
        names.push(card);

      return names;
  };

  /**
   * [getTrack2 description]
   * @param  {[type]} card [description]
   * @return {[type]}      [description]
   */
  this.getTrack2 = function(card){
    if(!card)
      return;

    var track2 = card.expiry_date + card.service_code + card.pvki + card.pvv + card.cvv;

    if(card.discretionary_data)
      track2 += card.discretionary_data;

    return track2;
  };


  /**
   * [decorateCardNumber description]
   * @param  {[type]} cardnumber [description]
   * @return {[type]}            [description]
   */
  this.decorateCardNumber = function(cardnumber){
    var decorated = '';

    for(var i = 0; i < cardnumber.length; i++){
      if(i % 4 === 0 && i !== 0 && cardnumber[i] !== ' '){
        decorated += ' ';
      }

      decorated += cardnumber[i];
    }

    return decorated;
  }
}

module.exports = CardsService;
