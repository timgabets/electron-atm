const StatesService = require('./src/services/states.js');
const settings = require('electron-settings');
const Log = require('./src/controllers/log.js');

let log = new Log();

let states = new StatesService(settings, log);
