const electron = require('electron')
const network = require('./network.js')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  //ipc.send('network-connect');
  //
  let host = document.getElementById('host').value;
  let port = document.getElementById('port').value;
  network.connect(host, port);
});

document.getElementById('send').addEventListener('click', _ => {
  //ipc.send('network-send');
  network.send();
});

document.getElementById('disconnect').addEventListener('click', _ => {
  //ipc.send('network-disconnect');
  network.disconnect();
});
