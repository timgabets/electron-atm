// Run this function after the page has loaded
// 

$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer
  const BrowserWindow = electron.remote.BrowserWindow
  const settings = nodeRequire('electron-settings');
  const mousetrap = nodeRequire('mousetrap');
  const path = nodeRequire('path')

  image_path = settings.get('image_path');
  if(image_path)
    image_path = image_path[0];

  /**
   * Navigation
   * 
   */
  var nav_buttons = [
    '#atm-button-menu', 
    '#states-button-menu', 
    '#screens-button-menu', 
    '#fits-button-menu', 
    '#emv-button-menu', 
    '#cards-button-menu',
    '#hardware-button-menu'];

  // elements is a dictionary of elements to be shown by clicking on each nav button. The other elements are to be hidden
  var elements = {
    '#atm-button-menu': ['#atm-page', '#atm-buffers', '#atm-bottom-navbar'],
    '#states-button-menu': ['#states-page', '#search-state-form', '#states-opcode-buffer-form'],
    '#screens-button-menu': ['#screens-page'],
    '#fits-button-menu': ['#fits-page'],
    '#emv-button-menu': ['#emv-page'],
    '#cards-button-menu': ['#cards-page', '#cards-page-form'],
    '#hardware-button-menu': ['#hardware-page'],
  };

  nav_buttons.forEach((button) => {
    $(button).on('click', _ => {
      for (var element in elements){
        if (elements.hasOwnProperty(element)){
          if(button === element){
            elements[element].forEach((e) => {
              $(e).show();
            });
          } else {
            elements[element].forEach((e) => {
              $(e).hide();
            });
          }
        }
      }
    })
  });

  replaceOnScreenText = function(){
    var screen_text = atm.display.getHTML();
    if(screen_text){
      screen_rows.forEach( (element) => {
        $( '#' + element + '-screen-row').html(screen_text[element]);
      });
     }
  };
  
  /**
   *  ATM
   */
  $('#atm-status-button').on('click', _ => {
    var connection_settings = settings.get('host');
    ipc.send('connect-button-pressed', connection_settings);
  });

  $('#card-inserted').on('click', _ => {
    var card = cards.get($('#atm-page-cards-list option:selected').text());
    var track2 = cards.getTrack2(card);

    if(card)
      ipc.send('ui-read-card', card.number, track2);
  });

  // Preventing page from refreshing when submit buttons pressed
  $('#connection-data-form').submit(function(e) {
    e.preventDefault();
  });

  $('#card-read-form').submit(function(e) {
    e.preventDefault();
  });

  // Updating screen image
  var screen_rows = ['at','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];  
  ipc.on('ui-change-screen-image', (event, image) => {
    if(image){
      var screen = atm.display.getScreen();

      // Clear text
      if(screen && screen.clear_screen){
        screen_rows.forEach( (element) => {
          $( '#' + element + '-screen-row').html('');
        });
      }
      
      replaceOnScreenText();

      // Changing image
      $('#screen').attr("src", image_path + '/' + image);
    }
  })

  setInterval(function() {
    replaceOnScreenText();
  }, 200);

  // FDKs shortcuts
  var FDKs = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'i'];
  FDKs.forEach( (element) => {
    mousetrap.bind(element, function() { 
      ipc.send('fdk-pressed', element.toUpperCase());
    });
  });

  // FDKs mouse click bindings
  FDKs = ['#FDK-A', '#FDK-B', '#FDK-C', '#FDK-D', '#FDK-F', '#FDK-G', '#FDK-H', '#FDK-I'];
  FDKs.forEach( (element) => {
    $(element).on('click', _ => {
      ipc.send('fdk-pressed', $(element).text());
    });
  });

  // Pinpad buttons keyboard shortcuts
  var pinpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'esc', 'enter', 'backspace'];
  pinpadButtons.forEach( (element) => {
    mousetrap.bind(element, function() { 
      ipc.send('pinpad-button-pressed', element);
    });
  });

  // Activating/deactivating FDK buttons
  var activeFDKs = [];
  setInterval(function() {
    if(atm.activeFDKs != activeFDKs){
      activeFDKs = atm.activeFDKs;
      
      FDKs.forEach( (element) => {
        $(element).prop('disabled', true);
      });

      activeFDKs.forEach( (button) => {
        if(button)
          $('#FDK-' + button).prop('disabled', false);
      })
    }
  }, 200);

  // Current state update
  let displayed_state;
  setInterval(function() {
    let current_state = atm.getCurrentState();
    if(current_state && displayed_state !== current_state && current_state.get('number')){
      //console.log(current_state);
      $('#current-state').val(current_state.get('number').toString() + ' ' + current_state.get('type'));
      ipc.send('ui-update-state', current_state);
      displayed_state = current_state;
    }
  }, 200);

  // Current screen update
  var current_screen = '';
  setInterval(function() {
    if(atm.display.getScreenNumber() != current_screen){
      current_screen = atm.display.getScreenNumber();
      if(current_screen)
        $('#current-screen').val(current_screen);
    }
  }, 200);

  let buffers = {};
  ['pin', 'B', 'C', 'opcode', 'amount'].forEach( (type) => {
    buffers[type] = '';

    setInterval(function() {
      if(atm.getBuffer(type) !== buffers[type]){
        buffers[type] = atm.getBuffer(type);
        $('#' + type + '-buffer').val(buffers[type]);
      }
    }, 200);
  });


  let keys = {};
  ['master', 'pin'].forEach((type) => {
    keys[type] = '';
    setInterval(function() {
      if(crypto.getKey(type)[0] != keys[type]){
        keys[type] = cards.decorateCardNumber(crypto.getKey(type)[0]);
        $('#' + type + '-key').val(keys[type]);
        $('#' + type + '-key-cv').val(crypto.getKey(type)[1]);
      }
    }, 500);
  });

  // Status button update
  var status = '';
  
  setInterval(function() {
    let objects = {
      // 'class': ['array', 'of', 'classes', 'to', 'remove']
      'button': ['btn-success', 'btn-warning', 'btn-danger'],
      'icon': ['glyphicon-link', 'glyphicon-wrench', 'glyphicon-remove-circle']
    };

    function clear(){
      for(let obj in objects)
      {
        objects[obj].forEach( (item) => {
          $('#atm-status-' + obj).removeClass(item);
        });
      }
    }

    function disableCardReader(status){
      $('#atm-page-cards-list').prop('disabled', true);
      $('#card-inserted').prop('disabled', true);
      if(status)
        $('#card-read-form').prop('title', 'Card Reader is disabled while ATM status is ' + status);
      else
        $('#card-read-form').prop('title', '');
    };

    function enableCardReader(){
      $('#atm-page-cards-list').prop('disabled', false);
      $('#card-inserted').prop('disabled', false);
      $('#card-read-form').prop('title', '');
    };

    if(atm.status != status){
      status = atm.status;
      
      clear();

      $('#atm-status-button').attr('title', 'ATM is ' + atm.status);
      switch(status){
        case 'Offline':
          //disableCardReader(status);
          $('#atm-status-icon').addClass('glyphicon-remove-circle');
          $('#atm-status-button').addClass('btn-danger');
          break;

        case 'Connected':
          //disableCardReader(status);
          $('#atm-status-icon').addClass('glyphicon-link');
          break;

        case 'In-Service':
          //enableCardReader();
          $('#atm-status-button').addClass('btn-success')
          $('#atm-status-icon').addClass('glyphicon-link');
          break;

        case 'Processing Card':
          //disableCardReader();      
          //$('#atm-status-button').addClass('btn-success')
          $('#atm-status-icon').addClass('glyphicon glyphicon-credit-card');
          break;

        case 'Out-Of-Service':
          //disableCardReader(status);
          $('#atm-status-button').addClass('btn-warning')
          $('#atm-status-icon').addClass('glyphicon-wrench');
          break;
      }      
    }
  }, 300);
})
