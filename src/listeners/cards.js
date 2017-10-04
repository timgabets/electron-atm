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
  });

  $("#cards-page-form").submit(function(e) {
    e.preventDefault();
  });

  $("#show-new-card-form-button").on('click', function(){
    $("#add-new-card-form-area").show();
    $("#hide-new-card-button-area").show();
    $("#show-new-card-form-button").hide();
  });

  $("#cancel-new-card-form-button").on('click', function(){
    $("#add-new-card-form-area").hide();
    $("#hide-new-card-button-area").hide();
    $("#show-new-card-form-button").show();
  });

  // Fill in Cards table
  cards.getNames().forEach( (name) => {
    var card = cards.get(name);
    
    table_record = '<a href="#" class="list-group-item">\
      <div class="row">\
        <div class="col-xs-1">';

      if(card.scheme)
        table_record += '<img id="scheme-logo" class="scheme-logo" src="img/schemes/' + card.scheme + '.png">';
      table_record += '</div>';

      table_record += '<div class="col-xs-2">' + card.name
      if(card.PIN)
        table_record += '<span class="badge" title="PIN">' + card.PIN + '</span>';
      table_record += '</div>';

      table_record += '<div class="col-xs-1">XX</div>'
      table_record += '<div class="col-xs-1">' + card.expiry_date + '</div>'
      table_record += '<div class="col-xs-1">' + card.service_code + '</div>'
      table_record += '<div class="col-xs-1">' + card.pvki + '</div>'
      table_record += '<div class="col-xs-1">' + card.pvv + '</div>'
      table_record += '<div class="col-xs-1">' + card.cvv + '</div>'
      
      table_record += '<div class="col-xs-1">' 
      if(card.discretionary_data)
        table_record += card.discretionary_data;
      table_record += '</div>';

      /*              
      table_record += '<div class="col-xs-2">\
        <button type="button" id="edit-card-' + card.number + '" class="btn btn-md" aria-label="">\
          <span id="" class="glyphicon glyphicon-edit" aria-hidden="true"></span>\
        </button>\
        <button type="button" id="remove-card-' + card.number + '" class="btn btn-md" aria-label="">\
          <span id="" class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>\
        </button>\
      </div>'
      */
            
      table_record += '</div>';
      table_record += '</a>';

      $("#cards-page-cards-list").append(table_record);
      $("#atm-page-cards-list").append('<option value="' + card.number + '">' + card.name + '</option>');

      $("#remove-card-" + card.number).on("click", _ => {
        console.log('Card to be removed: ' + card.number);
        // TODO: confirmation
        cards.remove(card.number);
      });

      $("#edit-card-" + card.number).on("click", _ => {
        // TODO: edit card
        console.log('Card to be edited: ' + card.number);
      });
/*
      '<option>' + name + '</option>');
    var card = cards.get(name);
    var table_record = '<tr>'
    table_record += '<td>'

    if(card.scheme)
      table_record += '<img class="scheme-logo" src="./img/schemes/' + card.scheme + '.png">';
    table_record += '</td>';  

    table_record += '<td>' + cards.decorateCardNumber(card.number);
    if(card.PIN)
      table_record += '<span class="badge" title="PIN">' + card.PIN +'</span>'
    table_record += '</td>'

    table_record += '<td>TODO</td>'
    table_record += '<td>' + card.name + '</td>'
    table_record += '<td>' + card.expiry_date + '</td>'
    table_record += '<td>' + card.service_code + '</td>'
    table_record += '<td>' + card.pvki + '</td>'
    table_record += '<td>' + card.pvv + '</td>'
    table_record += '<td>' + card.cvv + '</td>'

    table_record += '<td>'
    if(card.discretionary_data)
      table_record += card.discretionary_data
    table_record += '</td>'

    table_record += '<td>\
      <button id="edit-card-' + card.number + '" type="button" class="btn btn-md" aria-label="">\
        <span id="" class="glyphicon glyphicon-edit" aria-hidden="true"></span>\
      </button>\
      <button id="remove-card-' + card.number + '" type="button" class="btn btn-md" aria-label="">\
        <span id="" class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>\
      </button>\
    </td>';

    table_record += '</tr>';
    $("#tbody").append(table_record);

    $("#remove-card-" + card.number).on("click", _ => {
      console.log('Card to be removed: ' + card.number);
    });

    $("#edit-card-" + card.number).on("click", _ => {
      console.log('Card to be edited: ' + card.number);
    });
    */
  });
});