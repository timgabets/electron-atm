/**
 * Cards listener passes requests to/from CardsService
 */

const CardsService = nodeRequire('./src/services/cards.js');

let cards = new CardsService(settings, log);

ipc.on('cards-add-new-card', (event, card) => {
  cards.add(card);
})

$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer;
  const settings = nodeRequire('electron-settings');
  const CardsService = nodeRequire('./src/services/cards.js');

  let cards = new CardsService(settings);

  $("#add-new-card-form").validate();

  var payment_scheme;
  $('#cardnumber').blur(function(){
    var cardnumber = $('#cardnumber').val();
    if(cardnumber && cardnumber.length >= 16){
      payment_scheme = cards.getPaymentScheme(cardnumber);
      if(payment_scheme){
        $("#scheme-logo").show();
        $("#scheme-logo").attr('src', 'img/schemes/' + payment_scheme + '.png')
      } else 
        $("#scheme-logo").hide();
    }
  })
});