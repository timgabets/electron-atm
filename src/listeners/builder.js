/**
 * Builder listener handles translations from network binary message to internal application message object
 */

const electron = require('electron')
const Builder = require('../controllers/builder.js');
const ipc = electron.ipcRenderer

let atm = new Builder();

