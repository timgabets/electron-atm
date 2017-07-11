const electron = require('electron')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  ipc.send('network-connect');
});

document.getElementById('disconnect').addEventListener('click', _ => {
  ipc.send('network-disconnect');
});

document.getElementById('send').addEventListener('click', _ => {
  ipc.send('network-send');
});
