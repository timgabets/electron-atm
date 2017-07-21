/**
 * Listening to User Interface Events (buttons pressed, card inserted etc.)
 */

const electron = require('electron')
const ipc = electron.ipcRenderer

/*
document.getElementById('connect').addEventListener('click', _ => {
  ipc.send('network-connect', document.getElementById('host').value, document.getElementById('port').value);
});

document.getElementById('send-ready').addEventListener('click', _ => {
  var ready = '22\x1C000\x1C\x1C9'
  ipc.send('network-send', ready);  
});
*/

document.getElementById('FDK A').addEventListener('click', _ => {
  ipc.send('FDK Pressed', 'A');
});

document.getElementById('Connect').addEventListener('click', _ => {
  ipc.send('connect-button-pressed', '127.0.0.1', 11032);
});

document.getElementById('read-card').addEventListener('click', _ => {
  var track2 = document.getElementById('selected-card').value;
  ipc.send('ui-read-card', track2);
});