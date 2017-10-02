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


  this.get = function(name){
    return this.cards[name];
  };
}

module.exports = CardsService;
