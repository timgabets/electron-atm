/**
 * Cards listener passes requests to/from CardsService
 */

ipc.on('cards-add-new-card', (event, card) => {
  cards.add(card);
})

$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer;

  /**
   * [buildCardsList description]
   * @return {[type]} [description]
   */
  function buildCardsList(){
    cards.getNames().forEach( (name) => {
      var card = cards.get(name);

      var record = '<a href="#" class="list-group-item">\
        <div class="row">\
          <div class="col-xs-1">';

        if(card.scheme)
          record += '<img id="scheme-logo" class="scheme-logo" src="img/schemes/' + card.scheme + '.png" title="' + card.scheme + ' Payment Scheme">';
        record += '</div>';

        record += '<div class="col-xs-2" title="Card number">' + card.name + '</div>';
        record += '<div class="col-xs-1" title="Financial Institution ID">' + fits.getInstitutionByCardnumber(card.number) + '</div>'
        
        record += '<div class="col-xs-1">';
        if(card.PIN)
          record += '<span class="badge" title="PIN">' + card.PIN + '</span>';
        record += '</div>';

        record += '<div class="col-xs-1" title="Expiration Date">' + card.expiry_date + '</div>'
        record += '<div class="col-xs-1" title="Service Code">' + card.service_code + '</div>'
        record += '<div class="col-xs-1" title="PVK Index">' + card.pvki + '</div>'
        record += '<div class="col-xs-1" title="PIN Verification Value">' + card.pvv + '</div>'
        record += '<div class="col-xs-1" title="Card Verification Value">' + card.cvv + '</div>'
        
        record += '<div class="col-xs-1">' 
        if(card.discretionary_data)
          record += card.discretionary_data;
        record += '</div>';
              
        record += '</div>';
        record += '</a>';

        $("#cards-page-cards-list").append(record);
        $("#atm-page-cards-list").append('<option value="' + card.number + '">' + card.name + '</option>');
    });
  };

  $("#add-new-card-form").validate();

  var payment_scheme;
  $('#cardnumber').blur(function(){
    var cardnumber = $('#cardnumber').val();
    if(cardnumber && cardnumber.length >= 12){
      // Getting Payment scheme
      payment_scheme = cards.getPaymentScheme(cardnumber);
      if(payment_scheme){
        $("#scheme-logo").show();
        $("#scheme-logo").attr('src', 'img/schemes/' + payment_scheme + '.png')
      } else 
        $("#scheme-logo").hide();

      // Getting FIT id
      $("#FIT").val(fits.getInstitutionByCardnumber(cardnumber));

      //Decorating card number
      //$('#cardnumber').val(cards.decorateCardNumber(cardnumber));
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

  $("#save-new-card-button").on('click', function(){
    if($("#add-new-card-form").valid()){
      var card = {
        number: $('#cardnumber').val(),
        PIN: $('#PIN').val(),
        expiry_date: $('#expiry-date').val(),
        service_code: $('#service-code').val(),
        pvki: $('#pvk-index').val(),
        pvv: $('#pvv').val(),
        cvv: $('#cvv').val(),
        discretionary_data: $('#discr-data').val(),
      }
  
      ipc.send('ui-add-new-card', card);
    }
  });

  buildCardsList();
});