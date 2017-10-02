/**
 * Cards listener passes requests to/from CardsService
 */

const CardsService = nodeRequire('./src/services/cards.js');

let cards = new CardsService(settings, log);

ipc.on('cards-add-new-card', (event, card) => {
  cards.add(card);
})
