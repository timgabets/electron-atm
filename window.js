// Run this function after the page has loaded
$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer

  $('#connect').on('click', _ => {
    ipc.send('connect-button-pressed', '127.0.0.1', 11032);
  });

  $("#connection-data-form").submit(function(e) {
    e.preventDefault();
  });
})
