// Run this function after the page has loaded
$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer

  $('#connect').on('click', _ => {
    ipc.send('connect-button-pressed', $('#host').val(), $('#port').val());
  });

  $("#connection-data-form").submit(function(e) {
    e.preventDefault();
  });
})
