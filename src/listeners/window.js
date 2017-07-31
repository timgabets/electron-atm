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
      $("#screen").attr("src", "img/" + image)      
    }
  })

  // FDKs mouse click bindings
  var FDKs = ['#FDK-A', '#FDK-B', '#FDK-C', '#FDK-D', '#FDK-F', '#FDK-G', '#FDK-H', '#FDK-I'];
  FDKs.forEach( (element) => {
    $(element).on('click', _ => {
      ipc.send('fdk-pressed', $(element).text());
    });
  });

  // FDKs shortcuts
  FDKs = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'i'];
  FDKs.forEach( (element) => {
    mousetrap.bind(element, function() { 
      ipc.send('fdk-pressed', element.toUpperCase());
    });
  });

  // Pinpad buttons keyboard shortcuts
  var pinpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  pinpadButtons.forEach( (element) => {
    mousetrap.bind(element, function() { 
      ipc.send('pinpad-button-pressed', element);
    });
  });
})