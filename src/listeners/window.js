// Run this function after the page has loaded
$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer
  const settings = nodeRequire('electron-settings');
  const mousetrap = nodeRequire('mousetrap');

  $('#connect').on('click', _ => {
    settings.set('host', {
      'ip': $('#host').val(), 
      'port': $('#port').val()});

    ipc.send('connect-button-pressed', $('#host').val(), $('#port').val());
  });

  $('#card-inserted').on('click', _ => {
    ipc.send('ui-read-card', $('#cardnumber').val(), $('#track2').val());
  });

  // Preventing page from refreshing when submit buttons pressed
  $("#connection-data-form").submit(function(e) {
    e.preventDefault();
  });

  $("#card-read-form").submit(function(e) {
    e.preventDefault();
  });

  // Updating screen image
  ipc.on('ui-change-screen-image', (event, image) => {
    if(image){
      $("#screen").attr("src", "/home/tim/share/screens/" + image)      
    }
  })

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
  var current_state = '';
  setInterval(function() {
    if(atm.current_state.number != current_state){
      current_state = atm.current_state.number;
      if(atm.current_state.number)
        $("#current-state").val(atm.current_state.number.toString() + ' ' + atm.current_state.type);
    }
  }, 200);

  // Current screen update
  var current_screen = '';
  setInterval(function() {
    if(atm.current_screen.number != current_screen){
      current_screen = atm.current_screen.number;
      $("#current-screen").val(atm.current_screen.number);
    }
  }, 200);

  // PIN buffer update
  var PIN_buffer = '';
  setInterval(function() {
    if(atm.PIN_buffer != PIN_buffer){
      PIN_buffer = atm.PIN_buffer;
      $("#pin-buffer").val(PIN_buffer);
    }
  }, 200);

  // Buffer B update
  var buffer_B = '';
  setInterval(function() {
    if(atm.buffer_B != buffer_B){
      buffer_B = atm.buffer_B;
      $("#buffer-b").val(buffer_B);
    }
  }, 200);

  // Buffer C update
  var buffer_C = '';
  setInterval(function() {
    if(atm.buffer_C != buffer_C){
      buffer_C = atm.buffer_C;
      $("#buffer-c").val(buffer_C);
    }
  }, 200);

  // Opcode buffer update
  var opcode_buffer = '';
  setInterval(function() {
    if(atm.opcode_buffer != opcode_buffer){
      opcode_buffer = atm.opcode_buffer;
      $("#opcode-buffer").val(opcode_buffer);
    }
  }, 200);

  // Amount buffer update
  var amount_buffer = '';
  setInterval(function() {
    if(atm.amount_buffer != amount_buffer){
      amount_buffer = atm.amount_buffer;
      $("#amount-buffer").val(amount_buffer);
    }
  }, 200);

  // Terminal key update
  var terminal_pin_key = '';
  setInterval(function() {
    if(atm.terminal_pin_key != terminal_pin_key){
      terminal_pin_key = atm.terminal_pin_key;
      $("#comms-key").val(terminal_pin_key);
    }
  }, 200);

  // Master key update
  var terminal_master_key = '';
  setInterval(function() {
    if(atm.terminal_master_key != terminal_master_key){
      terminal_master_key = atm.terminal_master_key;
      $("#master-key").val(terminal_master_key);
    }
  }, 200);

})