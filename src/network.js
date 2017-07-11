
const ipc = electron.ipcRenderer

ipc.on('network-connect', (evt, count) => {
  document.getElementById('count').innerHTML = count
})