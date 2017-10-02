function CardsService(settings, log){
  this.cards = {};
  this.cards = settings.get('cards');
  if(!this.cards)
    this.cards = {};
  
  /**
   * [add description]
   * @param {[type]} card [description]
   */
  this.add = function(card){
    if(card.name === undefined || card.name === '')
      card.name = card.number;


    this.cards[card.name] = card;
    settings.set('cards', this.cards);
    return true;
  };

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
      if (this.cards.hasOwnProperty(card))
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
  }
}

module.exports = CardsService;
