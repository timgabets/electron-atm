class CardsService {
  constructor(settings, log){
    this.settings = settings;
    this.log = log;

    this.cards = {};
    this.cards = settings.get('cards');
    if(!this.cards)
      this.cards = {};
  }
  
  /**
   * [getPaymentScheme get payment scheme identifire, base on card number. 
   *                Of course, the life is much more complicated, and there are BIN tables
   *                for that purposes, but here we are just have a naive implementation, 
   *                based on the checking the first digit of the card number]
   * @param  {[type]} cardnumber [description]
   * @return {[type]}            [description]
   */
  getPaymentScheme(cardnumber){
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
  }

  /**
   * [add description]
   * @param {[type]} card [description]
   */
  add(card){
    card.number = card.number.split(' ').join('');
    card.name = this.decorateCardNumber(card.number);

    let scheme = this.getPaymentScheme(card.number);
    if(scheme)
      card.scheme = scheme;

    this.cards[card.number] = card;
    this.settings.set('cards', this.cards);

    return true;
  }

  /**
   * [remove description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  remove(name){
    this.cards[name] = undefined;
  }

  /**
   * [get description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  get(name){
    name = name.split(' ').join('');

    return this.cards[name];
  }

  /**
   * [getNames description]
   * @return {[type]} [description]
   */
  getNames(){
    let names = [];

    for (let card in this.cards)
      if (this.cards.hasOwnProperty(card) && this.cards[card])
        names.push(card);

    return names;
  }

  /**
   * [getTrack2 description]
   * @param  {[type]} card [description]
   * @return {[type]}      [description]
   */
  getTrack2(card){
    if(!card)
      return;

    let track2 = card.expiry_date + card.service_code + card.pvki + card.pvv + card.cvv;

    if(card.discretionary_data)
      track2 += card.discretionary_data;

    return track2;
  }


  /**
   * [decorateCardNumber description]
   * @param  {[type]} cardnumber [description]
   * @return {[type]}            [description]
   */
  decorateCardNumber(cardnumber){
    let parsed = cardnumber.split(' ').join('');
    let decorated = '';

    for(let i = 0; i < parsed.length; i++){
      if(i % 4 === 0 && i !== 0 && parsed[i] !== ' '){
        decorated += ' ';
      }

      decorated += parsed[i];
    }

    return decorated;
  }
}

module.exports = CardsService;
