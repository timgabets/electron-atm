const electron = require('electron')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  //ipc.send('connect');
  console.log('connect');
});

document.getElementById('disconnect').addEventListener('click', _ => {
  //ipc.send('disconnect');
  console.log('disconnect');
});

document.getElementById('send').addEventListener('click', _ => {
  //ipc.send('send');
  console.log('send');
});
