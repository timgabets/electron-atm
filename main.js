const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Inter Process communication module
const ipc = electron.ipcMain

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window = null

function createWindow () {
  // Create the browser window.
  window = new BrowserWindow({
    width: 1200, 
    height: 600,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it ready, this prevents any white flickering
    show: false
  })

  // and load the index.html of the app.
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  window.webContents.openDevTools()

  // Show window when page is ready
  window.once('ready-to-show', function () {
    window.show()
  })

  // Emitted when the window is closed.
  window.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
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