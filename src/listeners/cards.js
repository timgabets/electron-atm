/**
 * Cards listener passes requests to/from CardsService
 */

$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer;

  /**
   * [appendCard description]
   * @param  {[type]} card [description]
   * @return {[type]}      [description]
   */
  function appendCard(card){
    var record = '<a href="#" class="list-group-item">\
        <div class="row">\
          <div class="col-xs-1">';

    if(card.scheme)
      record += '<img class="scheme-logo" src="img/schemes/' + card.scheme + '.png" title="' + card.scheme + ' Payment Scheme">';
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

    $('#cards-page-cards-list').append(record);
  }

  /**
   * [buildCardsList description]
   * @return {[type]} [description]
   */
  function buildCardsList(){
    cards.getNames().forEach( (name) => {
      var card = cards.get(name);
      appendCard(card);
      
      if(card.number === settings.get('last_used_card'))
        $('#atm-page-cards-list').append('<option value="' + card.number + '" selected>' + card.name + '</option>')
      else
        $('#atm-page-cards-list').append('<option value="' + card.number + '">' + card.name + '</option>')        
    });

    if(cards.getNames().length > 0){
      $('#card-inserted').show();
      $('#atm-page-cards-list').show();
      $('#atm-no-cards-add-card').hide();    
    } else {
      $('#card-inserted').hide();
      $('#atm-page-cards-list').hide();
      $('#atm-no-cards-add-card').show();

      $('#atm-no-cards-add-card').on('click', function(){
        $('#cards-button-menu').click();
        $('#show-new-card-form-button').click();
      });
    }
  };

  $('#add-new-card-form').validate();

  var payment_scheme;
  $('#cardnumber').blur(function(){
    var cardnumber = $('#cardnumber').val();
    if(cardnumber){
      // Getting Payment scheme
      payment_scheme = cards.getPaymentScheme(cardnumber);
      if(payment_scheme){
        $('#new-card-scheme-logo').show();
        $('#new-card-scheme-logo').attr('src', 'img/schemes/' + payment_scheme + '.png')
      } else 
        $('#new-card-scheme-logo').hide();

      // Getting FIT id
      $('#FIT').val(fits.getInstitutionByCardnumber(cardnumber));
    }
  });

  $('#cards-page-form').submit(function(e) {
    e.preventDefault();
  });

  $('#show-new-card-form-button').on('click', function(){
    $('#add-new-card-form-area').show();
    $('#hide-new-card-button-area').show();
    $('#show-new-card-form-button').hide();
  });

  $('#cancel-new-card-form-button').on('click', function(){
    $('#add-new-card-form-area').hide();
    $('#hide-new-card-button-area').hide();
    $('#show-new-card-form-button').show();
  });

  $('#save-new-card-button').on('click', function(){
    if($('#add-new-card-form').valid()){
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
    
      if(cards.add(card)){
        appendCard(card);
      } else {
        log.error('Error adding card');
      }
    }
  });

  buildCardsList();
});