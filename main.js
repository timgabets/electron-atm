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
    width: 1480,
    // Set the initial height to 600px
    // IMPORTANT: change .fits-list height in style.css as well
    height: 700, 
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it ready, this prevents any white flickering
    show: false,
    icon: path.join(__dirname, '/img/icon.png'),
    title: 'Electron ATM'
  })

  // Open the DevTools.
  // window.webContents.openDevTools()

  // Load a URL in the window to the local atm.html path
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

ipc.on('settings-entered-network-connect', (event, connection_settings) => {
  window.webContents.send('network-connect', connection_settings)
})

ipc.on('fdk-pressed', (event, FDK) => {
  window.webContents.send('atm-process-fdk-pressed', FDK)
})

ipc.on('pinpad-button-pressed', (event, button) => {
  window.webContents.send('atm-process-pinpad-button-pressed', button)
})

ipc.on('connect-button-pressed', (event, connection_settings) => {
  window.webContents.send('network-connect', connection_settings)
})

ipc.on('network-connection-status-change', (event, isConnected) => {
  if(isConnected)
    window.webContents.send('atm-network-connection-established')
  else
    window.webContents.send('atm-network-disconnected')
})

ipc.on('network-data-received', (event, data) => {
  window.webContents.send('parse-host-message', data)
})

ipc.on('host-message-parsed', (event, data) => {
  window.webContents.send('atm-process-host-message', data)
})

ipc.on('build-message-to-host', (event, message) => {
  window.webContents.send('build-message-to-host', message)
})

ipc.on('atm-message-built', (event, data) => {
  window.webContents.send('network-send', data)
})

ipc.on('ui-read-card', (event, cardnumber, track2) => {
  window.webContents.send('atm-read-card', cardnumber, track2)
})

ipc.on('atm-change-screen-image', (event, image) => {
  window.webContents.send('ui-change-screen-image', image)
})

ipc.on('ui-update-state', (event, state) => {
  window.webContents.send('ui-change-current-state-on-states-page', state)
})
