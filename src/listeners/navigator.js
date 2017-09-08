const StatesService = require('./src/services/states.js');
const ScreensService = require('./src/services/screens.js');
const settings = require('electron-settings');
const Log = require('./src/controllers/log.js');
const Trace = require('./src/controllers/trace.js');

let log = new Log();
let trace = new Trace();

let states = new StatesService(settings, log);
let screens = new ScreensService(settings, log);
