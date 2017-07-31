// Run this function after the page has loaded
$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer
  const settings = nodeRequire('electron-settings');

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

  var FDKs = ['#FDK-A', '#FDK-B', '#FDK-C', '#FDK-D', '#FDK-F', '#FDK-G', '#FDK-H', '#FDK-I'];
  FDKs.forEach( (element) => {
    $(element).on('click', _ => {
      ipc.send('FDK Pressed', $(element).text());
    });
  });
})