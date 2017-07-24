var electron = require('electron') // http://electron.atom.io/docs/api
var path = require('path')         // https://nodejs.org/api/path.html
var url = require('url')           // https://nodejs.org/api/url.html
const ipc = electron.ipcMain

var window = null

// Wait until the app is ready
electron.app.once('ready', function () {
  // Create a new window
  window = new electron.BrowserWindow({
    // Set the initial width to 800px
    width: 1950,
    // Set the initial height to 600px
    height: 650,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it ready, this prevents any white flickering
    show: false
  })

  // Open the DevTools.
  window.webContents.openDevTools()

  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Show window when page is ready
  window.once('ready-to-show', function () {
    window.show()
  })
})

ipc.on('FDK Pressed', (event, FDK) => {
  window.webContents.send('atm-process-button-pressed', FDK)
})

ipc.on('connect-button-pressed', (event, host, port) => {
  window.webContents.send('network-connect')
})

ipc.on('network-data-received', (event, data) => {
  window.webContents.send('parse-host-message', data)
})

ipc.on('host-message-parsed', (event, data) => {
  window.webContents.send('atm-process-host-message', data)
})

ipc.on('build-atm-response', (event, data) => {
  window.webContents.send('build-atm-response', data)
})

ipc.on('atm-message-built', (event, data) => {
  window.webContents.send('network-send', data)
})

ipc.on('ui-read-card', (event, data) => {
  window.webContents.send('atm-read-card', data)
})

