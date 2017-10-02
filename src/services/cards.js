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
}

module.exports = CardsService;
